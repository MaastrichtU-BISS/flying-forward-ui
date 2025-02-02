// @ts-nocheck
import React from 'react'
import Form from '@rjsf/material-ui'
import * as API from '../API'
import { Modal, Button, Box, Typography, TextField, Paper,IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getQueryBuilderSchema, DEFAULT_FORM_DATA } from './constants'
import { NodeAttributes } from '../../../src/API'
import { NODE_LIMIT } from '..'

export type QueryBuilderProps = {
  query: any;
  onStart: () => void;
  onError: (e: Error) => void;
  onFinish: (data: any) => void;
  onNetworkStatisticsCalculated: (data: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

const transformData = (data) => {
  // console.log(data)

  // const date = data.Date;
  // console.log(date)
  // return {
  //   "DateStart": `${date[0]}-01-01`,
  //   "DateEnd": `${date[1]}-12-31`,
  //   ...data
  // }

  return data;
}

export const QueryBuilder = (props: QueryBuilderProps) => {
  const {
    isOpen,
    onStart,
    onError,
    onFinish,
    query,
    onClose,
    onNetworkStatisticsCalculated,
  } = props

  const [state, setState] = React.useState(query)
  const formRef= React.useRef()
  React.useEffect(() => {
    setTimeout(()=> {
      const  event = new Event('click')
      event.persist = ()=>{}
      formRef.current.onSubmit(event)
    }, 1000)
  }, [])
  return (
    <Modal
      open={isOpen}
      // onClose={onClose}
      style={{
        display: 'flex',
        // flexDirection: 'column-reverse',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      BackdropProps={{
        // style: {
        //   backgroundColor: 'rgba(0, 0, 0, 0)',
        // },
        // onClick: () => {
        // },
      }}
    >
      <Paper style={{
        display: 'flex',
        flexDirection: 'column',
        width: '80%',
        height: '80%',
        padding: 25,
        overflow: 'scroll'
      }}
      >
        
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10
          }}
        >
          <Typography variant="h6">Query Builder</Typography>
          <IconButton 
            aria-label="Example"
            onClick={onClose}
            // style={{
            //   position: 'absolute',
            //   right: 24,
            //   top: 24
            // }}
          >
            <CloseIcon  />
          </IconButton>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Form
            ref={formRef}
            schema={getQueryBuilderSchema().schema}
            uiSchema={getQueryBuilderSchema().uiSchema}
            onChange={e => setState(e.formData)}
            formData={state}
            onSubmit={async e => {
              onStart()
              try {
                let casesData = await API.listCases(transformData(e.formData))
                // let casesData = prepareData(cases)
                console.log('RESULT getCases', casesData)
                if (casesData.nodes.length == 0) {
                  throw new Error("No cases returned")
                } else {
                  const allNodes = casesData?.nodes.map((node)=> ({
                    id: node.id,
                    data: JSON.stringify(node.data)
                  }))
                  const allEdges = casesData?.edges.map((edge)=> ({ 
                    id: edge.id,
                    source: edge.source,
                    target: edge.target
                  }))
                  let subNetwork = await API.getSubnetwork({
                    nodes: allNodes,
                    edges: allEdges,
                    maxNodes: NODE_LIMIT
                  })
                  console.log('RESULT getSubnetwork', subNetwork)
                  onFinish({
                    nodes: subNetwork.nodes,
                    edges: subNetwork.edges,
                    message: casesData.message,
                  })
                  let allNodesWithData = await API.batchGetElementData({
                    attributesToFetch: NodeAttributes.NETWORKSTATS,
                    nodes: allNodes
                  })
                  console.log('RESULT batchFetchData', allNodesWithData)
                  const allNodesData = allNodesWithData?.map((node)=> ({
                    id: node.id,
                    data: JSON.stringify(node.data)
                  }))
                  let networkStatistics = await API.getNetworkStatistics({
                    nodes: allNodesData,
                    edges: allEdges
                  })
                  console.log('RESULT getNetworkStatistics', networkStatistics)
                  onNetworkStatisticsCalculated({
                    networkStatistics: networkStatistics,
                    message: casesData.message,
                    allNodes: allNodesData,
                    allEdges,
                    subNetwork,
                  })
                }
              } catch (e) {
                console.log(e)
                onError(e)
              }
            }}
          />
        </Box>
      </Paper>
    </Modal>

  )

}


