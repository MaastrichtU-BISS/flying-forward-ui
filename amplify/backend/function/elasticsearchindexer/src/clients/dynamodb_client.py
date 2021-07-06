import boto3
from boto3.dynamodb.conditions import Key, Attr
import time
from utils import build_projection_expression


class DynamodbClient:

    def __init__(self, table_name, item_limit=100, page_limit=1):
        self.ddb = boto3.resource('dynamodb')
        self.table_name = table_name
        self.table = self.ddb.Table(self.table_name)
        self.item_limit=item_limit      # max number of items to evaluate per query (page)
        self.page_limit=page_limit      # max number of queries (pages)

    
    def execute_query(self, **query_params):
        """
        retrieves all items matching query parameters from DynamoDB
    
        :param query_params: dict of DynamoDB query parameters
        :return: dict containing response meta data and list of items matching query, flag whether item limit was reached
        """
        start = time.time()
        response = self.table.query(**query_params, Limit=self.item_limit)
        count = response['Count']
        items = response['Items']
        scanned_count = response['ScannedCount']
        pages = 1
        limit_reached = False

        # use pagination to retrieve full list of results
        while 'LastEvaluatedKey' in response:
            if len(items) >= self.item_limit * self.page_limit:
            #if pages == self.page_limit: #* 10 or len(items) >= self.item_limit * self.page_limit: # @TODO
                limit_reached = True
                print(f'DYNAMOBO REQUEST LIMIT REACHED! {len(items)} items fetched.')
                break
            response = self.table.query(**query_params, ExclusiveStartKey=response['LastEvaluatedKey'], Limit=self.item_limit)
            count += response['Count']
            items.extend(response['Items'])
            scanned_count += response['ScannedCount']
            pages += 1

        #print('Duration ddb query:', time.time()-start)
        #print('Pages scanned: ', pages)
        response['Count'] = count
        response['Items'] = items
        response['ScannedCount'] = scanned_count

        return response, limit_reached


    def execute_batch(self, keys_list, return_attributes):
        """
        retrieves given attributes for given list of item keys from DynamoDB
    
        :param keys_list: list of dicts containing DynamoDB key value pairs
        :param return_attributes: list of string attribute names to return
        :return: list of dict items
        """
        start = time.time()

        # filter out duplicate entries
        keys_list = [dict(t) for t in {tuple(sorted(d.items())) for d in keys_list}]

        # substitute attribute names to avoid conflicts with DynamoDB reserved words
        projection_expression, expression_attribute_names = build_projection_expression(return_attributes)

        # disect requests into batches of 100 to avoid limit errors
        batch = keys_list[:100]
        rest = keys_list[100:]

        items = []

        while batch != []:
            response = self.ddb.batch_get_item(
                RequestItems={
                    self.table_name: {
                        'Keys': batch,
                        'ProjectionExpression': projection_expression,
                        'ExpressionAttributeNames': expression_attribute_names
                    }
                }
            )
            items.extend(response['Responses'][self.table_name])
            if response['UnprocessedKeys']:
                #print(response['UnprocessedKeys'])
                rest.extend(response['UnprocessedKeys'][self.table_name]['Keys'])
            batch = rest[:100]
            rest = rest[100:]

        #print('Duration ddb batch execution: ', time.time() - start)
        return items
