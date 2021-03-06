import React, { Component } from 'react'
import { connect } from 'react-redux'

import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';

import UserService from "../../services/UserService";
import API from "../../apiManager/endpoints";
import "./bpm.scss"


const ProcessDiagram = class extends Component {

  constructor(props) {
    super(props);

    this.state = { };

    this.containerRef = React.createRef();
  }

  UNSAFE_componentWillMount() {
  }

  componentDidMount() {

    const {
      process_key,
      diagramXML
    } = this.props;

    const container = this.containerRef.current;
    this.bpmnViewer = new BpmnJS({ container });

    this.bpmnViewer.on('import.done', (event) => {
      const {
        error,
        warnings
      } = event;

      if (error) {
        return this.handleError(error);
      }

      // this.bpmnViewer.get('canvas').zoom('fit-viewport');
      // console.log("canvas",this.bpmnViewer.get('canvas'))
      // if(this.bpmnViewer.get('canvas') && this.bpmnViewer.get('canvas')._viewport&&this.bpmnViewer.get('canvas')._viewport.getCTM()){
      // this.bpmnViewer.get('canvas').zoom(1);
    // }

      return this.handleShown(warnings);
    });

    if (process_key) {
      return this.fetchDiagram(process_key);
    }

    if (diagramXML) {
      return this.displayDiagram(diagramXML);
    }

  }
  

  componentWillUnmount() {
    this.bpmnViewer.destroy();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      props,
      state
    } = this;

    if (props.process_key !== prevProps.process_key) {
      return this.fetchDiagram(props.process_key);
    }

    const currentXML = props.diagramXML || state.diagramXML;

    const previousXML = prevProps.diagramXML || prevState.diagramXML;
    // this.bpmnViewer.get('canvas').zoom('fit-viewport');
    if (currentXML && currentXML !== previousXML) {
      return this.displayDiagram(currentXML);
    }
  }

  displayDiagram(diagramXML) {
    this.bpmnViewer.importXML(diagramXML);
  }

  fetchDiagram(process_key) {
    const url =API.PROCESSES+'/'+process_key+'/xml';

    this.handleLoading();

    fetch(url, { 
      method: 'get', 
      headers: new Headers({
        'Authorization': 'Bearer '+UserService.getToken()
      })})
      .then(res => res.json())
      .then(resJson => this.setState({ diagramXML: resJson.bpmn20Xml }))
      .catch(err => this.handleError(err));
      
  }

  handleLoading() {
    const { onLoading } = this.props;

    if (onLoading) {
      onLoading();
    }
  }

  handleError(err) {
    console.log(err);
    const { onError } = this.props;

    if (onError) {
      onError(err);
    }
  }

  handleShown(warnings) {
    const { onShown } = this.props;

    if (onShown) {
      onShown(warnings);
    }
  }

  render() {

    return (
      <div className="react-bpmn-diagram-container bpm-container" ref={ this.containerRef }></div>
    );
  }
};

export default connect(
  null,
  null,
)(ProcessDiagram);
