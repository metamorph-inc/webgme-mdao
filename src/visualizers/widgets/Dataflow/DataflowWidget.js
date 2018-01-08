/*globals define, WebGMEGlobal*/
/*jshint browser: true*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Wed Jan 03 2018 13:04:07 GMT-0600 (Central Standard Time).
 */

import React from 'react';
import ReactDOM from 'react-dom';

define(['css!../../widgets/Dataflow/styles/DataflowWidget.css'], function () {
    'use strict';


    class Component extends React.Component {
        constructor() {
            super();
            this.handleClick = this.handleClick.bind(this);
        }

        handleClick() {
            this.props.dispatchEvent('inspect', {id: this.props.id, type: 'Component'});
        }

         render() {
                  var _props = this.props,
                      name = _props.name,
                      top = _props.top,
                      left = _props.left;

                  return <div className='Component' style={{ top: top + 'px', left: left + 'px', zIndex: 2 }} onClick={this.handleClick}>
                      {name}</div>
              }
          }

      class Connection extends React.Component {
          constructor() {
              super();
              this.handleClick = this.handleClick.bind(this);
          }

          handleClick() {
              this.props.dispatchEvent('inspect', {id: this.props.id, type: 'Connection'});
          }

          render() {
            var {points} = this.props;
            return <polyline xmlns="http://www.w3.org/2000/svg" points={points} markerEnd="url(#triangle)" stroke="black" strokeWidth="2" fill="none" onClick={this.handleClick}/>
          }
      }

      class Inspector extends React.Component {
          render() {
              var {name} = this.props;
              return <div className="inspector">
                {name}
              </div>;
          }
      }

      class App extends React.Component {
          constructor() {
              super();
              this.state = {
                  components: [
                      // { id: '/a/b/c', top: 100, left: 400, name: 'tst'}
                  ],
                  connections: [],
                  dispatchEvent: () => {},
                  inspectorHeight: 100,
                  inspector: {}
              };
          }

          render() {
                  const {components, connections, dispatchEvent, width, height, inspectorHeight, inspector} = this.state;

                  const componentsHeight = components.map(c => { return c.top }).reduce((a, b) => { return Math.max(a,b) }, 0);

                    // <div style={{width: '100%', height: components.map(c => { return c.top }).reduce((a, b) => { return Math.max(a,b) }, 0) + 200 + 'px' }}>
                    // <div style={{width: '100%', height: 'calc(100% - 3em)'}}>
                  return (
                    <div style={{width, height}}>

                    <div style={{width: '100%', height: `calc(100% - ${inspectorHeight}px)`, overflow: 'auto'}}>
                    <div style={{width: '100%', height: componentsHeight + 150 + 'px', position: 'relative'}}>
                      { components.map(function (c) {
                          return <Component key={c.id} id={c.id} top={c.top} left={c.left} name={c.name} dispatchEvent={dispatchEvent} />;
                      }) }
                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{position: "absolute", overflow: "unset"}}>
                      <marker xmlns="http://www.w3.org/2000/svg" id="triangle" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">
                          <path d="M 0 0 L 10 5 L 0 10 z"/>
                      </marker>
                      { connections.map(c => {
                          return (
                            <Connection key={c.id} id={c.id} points={c.points} dispatchEvent={dispatchEvent} />
                          )
                      })
                      }
                      </svg>
                      </div>
                      </div>
                      <div style={{width: '100%', height: inspectorHeight + 'px', top: `calc(100% - ${inspectorHeight}px)`, position: 'absolute', backgroundColor: 'lightgrey'}}><Inspector {...inspector}/></div>
                      </div>
                    );
              }
          }

    var DataflowWidget,
        WIDGET_CLASS = 'dataflow';

    DataflowWidget = function DataflowWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this.nodes = {};
        this._initialize();

        this.components = [];
        this.connections = {};
        this.newConnections = [];
        this._logger.debug('ctor finished');
    };

    DataflowWidget.prototype._initialize = function () {
        // set widget class
        this._el.addClass(WIDGET_CLASS);

        this.app = ReactDOM.render(<App/>, this._el.get(0));

        // Create a dummy header
        // this._el.append('<h3>Dataflow Events:</h3>');

        // Registering to events can be done with jQuery (as normal)
        /*this._el.on('dblclick', event => {
            event.stopPropagation();
            event.preventDefault();
            this.onBackgroundDblClick();
        }); */
    };

    DataflowWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');

        var state = this.app.state;
        state.width = width;
        state.height = height;
        this.app.setState(state);
    };

    DataflowWidget.prototype.render = function () {
    };

    // Adding/Removing/Updating items
    DataflowWidget.prototype.addNode = function (desc) {
        this.nodes[desc.id] = desc;

        if (desc && desc.type === 'Component') {
            this.components.push(desc);
        } else if (desc && desc.type === 'Dataflow') {
            this.newConnections.push(desc);
        }
    };

    function getParentId(id) {
        return id.substr(0, id.lastIndexOf('/'));
    };

    function getConnectionsKey(connection) {
        var strip = getParentId;
        return strip(connection.srcId) + '__' + strip(connection.dstId);
    };

    DataflowWidget.prototype.territoryComplete = function () {
        var counter = 0;
        this.components.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        this.components.forEach(component => {
          component.top = 80 + counter * 100;
          component.left = 80 + counter * 100;
          counter++;
        });

        var newConnections = this.newConnections;
        this.newConnections = [];
        newConnections.forEach(this.updateConnection.bind(this));

        Object.getOwnPropertyNames(this.nodes).forEach(nodesKey => {
          var desc = this.nodes[nodesKey];
          if (desc.type === "Dataflow") {
            // FIXME update only connections whose endpoints changed
            this.updateConnection(desc);
          }
        });

        var connections = Object.getOwnPropertyNames(this.connections).map(connectionsKey => {
            var connection = this.connections[connectionsKey];
            var desc = connection.valueflows[0];
            var srcRect = this.nodes[getParentId(desc.srcId)];
            var dstRect = this.nodes[getParentId(desc.dstId)];
            if (!srcRect || !dstRect) {
              return;
            }
            var points;
            if (srcRect.top < dstRect.top) {
                var magic = 5; // FIXME: computed from Component border+padding+1
                points = `${srcRect.left + 100} ${srcRect.top + 31} ${dstRect.left + 50} ${srcRect.top + 31} ${dstRect.left + 50} ${dstRect.top - magic}`;
            } else {
                var magic = 5; // FIXME: computed from Component border+padding+1
                points = `${srcRect.left} ${srcRect.top + 31} ${dstRect.left + 50} ${srcRect.top + 31} ${dstRect.left + 50} ${dstRect.top + 62 + magic}`;
            }
            var id = connection.id;
            return {id, points};
        }).filter(connection => connection.points);
          this.app.setState({ components: this.components,
              connections: connections,
              dispatchEvent: ((name, args) => {
                  console.log(args);
                  this.app.state.inspector = args;
                  if (args.type === 'Component') {
                      args.name = this.nodes[args.id].name;
                  }
                  if (args.type === 'Connection') {
                      const connection = this.connections[args.id];
                      args.valueflows = [];
                      Object.getOwnPropertyNames(this.nodes).forEach((function (id) {
                          const node = this.nodes[id];
                          if (node.type === 'Dataflow' && connection.id === getConnectionsKey(node)) {
                            //  throw Error();
                            args.valueflows.append({name: node.name});
                          }
                      }).bind(this));
                  }
                  this.app.setState(this.app.state);
              }).bind(this)
            });
    };

    DataflowWidget.prototype.removeNode = function (gmeId) {
        var desc = this.nodes[gmeId];
        // this._el.append('<div>Removing node "' + desc.name + '"</div>');
        if (desc.connection) {
            var index = desc.connection.valueflows.indexOf(desc);
            desc.connection.valueflows.splice(index, 1);
            if (desc.connection.valueflows.length === 0) {
                delete this.connections[desc.connection.id];
            }
        }
        var componentIndex = this.components.indexOf(desc);
        if (componentIndex !== -1) {
          this.components.splice(componentIndex, 1);

        }
        delete this.nodes[gmeId];
    };

    DataflowWidget.prototype.updateConnection = function (desc) {
      if (desc.connection && (!desc.srcId || !desc.dstId)) {
        var index = desc.connection.valueflows.indexOf(desc);
        if (index === -1) {
          return;
        }
        desc.connection.valueflows.splice(index, 1);
        if (desc.connection.valueflows.length === 0) {
            delete this.connections[desc.connection.id];
        }
        delete desc.connection;
      }
      if (!desc.connection && (desc.srcId && desc.dstId)) {
        var connection = this.connections[getConnectionsKey(desc)];
        if (connection === undefined) {
            connection = this.connections[getConnectionsKey(desc)] = {id: getConnectionsKey(desc), valueflows: []};
        }
        this.nodes[desc.id].connection = connection;
        connection.valueflows.push(desc);
      }
    }

    // copy undefined values too (unlike JQuery)
    function extend(dst, src) {
      Object.getOwnPropertyNames(src).forEach(key => {
        dst[key] = src[key];
      });
    };

    DataflowWidget.prototype.updateNode = function (desc) {
        if (desc) {
            this._logger.debug('Updating node:', desc);
            extend(this.nodes[desc.id], desc);
            if (desc.type === "Dataflow") {
              // console.log(JSON.stringify(desc, (k, v) => { return  v === undefined ? null : v; }));
              this.updateConnection(this.nodes[desc.id]);
            }
            // this._el.append('<div>Updating node "' + desc.name + '"</div>');
        }
    };

    /* * * * * * * * Visualizer event handlers * * * * * * * */

    DataflowWidget.prototype.onNodeClick = function (/*id*/) {
        // This currently changes the active node to the given id and
        // this is overridden in the controller.
    };

    DataflowWidget.prototype.onBackgroundDblClick = function () {
        // this._el.append('<div>Background was double-clicked!!</div>');
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    DataflowWidget.prototype.destroy = function () {
    };

    DataflowWidget.prototype.onActivate = function () {
        this._logger.debug('DataflowWidget has been activated');
    };

    DataflowWidget.prototype.onDeactivate = function () {
        this._logger.debug('DataflowWidget has been deactivated');
    };

    return DataflowWidget;
});
