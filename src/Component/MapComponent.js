import React from "react";
import { Segment, Grid, Header, Select } from "semantic-ui-react";
import { Line } from "react-chartjs-2";
import { PointAPI } from "../API/point";
class MapComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            markers: [],
            tempCoor: null,
            elevation: [],
            heightTower: 0.0,
            first: 0.0,
            last: 0.0,
            line: [],
            resolution: [],
            polygon: null,
            linestring: null,
            point: null
        }
    }
    createMap() {
        let map = new window.google.maps.Map(this.refs.map, {
            center: { lat: -8.5906451, lng: 116.4568982 },
            zoom: 8,
            mapTypeId: "terrain",
            disableDefaultUI: true,
            zoomControl: true,
            rotateControl: true,
            fullscreenControl: true,
            scaleControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        })
        return map;
    }
    componentDidMount() {
        let map = this.createMap();
        let elevationContainer = document.getElementById('elevation_comp')
        map.controls[window.google.maps.ControlPosition.RIGHT_CENTER].push(elevationContainer);
        let drawingManager = new window.google.maps.drawing.DrawingManager({
            drawingMode: window.google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['marker', 'polygon', 'polyline']
            },
            polylineOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1
            },
            polygonOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 1,
                clickable: true,
                editable: true,
                zIndex: 1
            }

        });
        drawingManager.setMap(map);
        let icon = document.createElement('i');
        window.google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
            if (event.type === 'polyline') {
                let line = event.overlay;
                if (this.state.linestring) {
                    this.state.linestring.setMap(null);
                }
                line.addListener('click', (e) => {
                    console.log(line.getPath().getArray())
                })
                this.setState({
                    linestring: line
                })
            }
            if (event.type === 'marker') {
                console.log(event)
                let marker = event.overlay;
                if (this.state.point) {
                    this.state.point.setMap(null);
                }
                marker.addListener('click', (e) => {
                    let button = document.createElement(`button`);
                    button.className = "mini ui button";
                    button.appendChild(icon);
                    button.innerText = "Save Me";
                    button.onclick = () => {
                        let saveRequest = PointAPI.savePoint({
                            point: {
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng()
                            },
                            keterangan: "Aha"
                        })
                        saveRequest.then(res => {
                            console.log(res);
                        })
                    }
                    let infowindow = new window.google.maps.InfoWindow({
                        content: button
                    });
                    infowindow.open(map, marker);
                });
                this.setState({
                    point: marker
                })
            }
            if (event.type === 'polygon') {
                let polygon = event.overlay;
                if (this.state.polygon) {
                    this.state.polygon.setMap(null);
                }
                polygon.addListener('click', (e) => {
                    console.log(polygon.getPath().getArray());
                })
                this.setState({
                    polygon: polygon
                })
            }
        });
        let markers = this.state.markers;

        let elevator = new window.google.maps.ElevationService;
        
        map.addListener('click', (event) => {
            let marker = new window.google.maps.Marker({
                position: event.latLng,
                map: map
            });
            let icon = document.createElement('i');
            icon.className = "save icon";
            marker.addListener('click', (e) => {
                if (this.state.tempCoor) {
                    let flightPath = new window.google.maps.Polyline({
                        path: [this.state.tempCoor, e.latLng],
                        geodesic: true,
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 3
                    });
                    flightPath.setMap(map);
                    flightPath.addListener('click', (ev) => {
                        elevator.getElevationAlongPath({
                            'path': flightPath.getPath().b,
                            'samples': 256
                        }, this.plotElevation.bind(this));
                    })
                    let line = this.state.line;
                    line.push(flightPath);
                    this.setState({
                        tempCoor: null,
                        line: line
                    })
                } else {
                    this.setState({
                        tempCoor: e.latLng
                    });
                }
            });
            markers.push(marker);
            this.setState({
                markers: markers
            })

        })
        
    }

    onChangeHeight(event, { value }) {
        let { elevation, first, last } = this.state;
        if (elevation.length > 0) {
            elevation[0] = first;
            elevation[elevation.length - 1] = last;

        }
        this.setState({
            elevation: elevation,
            heightTower: value
        })

    }

    plotElevation(elevations, status) {
        if (status === "OK") {
            const temp = [];
            const resolution = [];
            elevations.forEach((data) => {
                temp.push(data.elevation)
                resolution.push(".");
            });

            this.setState({
                elevation: temp,
                first: temp[0],
                last: temp[temp.length - 1],
                resolution: resolution
            })

        }
    }

    render() {
        const options = [
            { key: '10', text: '10 m', value: 10.0 },
            { key: '20', text: '20 m', value: 20.0 },
            { key: '30', text: '30 m', value: 30.0 },
            { key: '40', text: '40 m', value: 40.0 },
        ];
        const { elevation, heightTower, resolution } = this.state;
        let temp = [];
        if (elevation.length > 0) {
            console.log(heightTower)
            let first = elevation[0] + heightTower;
            let last = elevation[elevation.length - 1] + heightTower;
            console.log(first)
            temp = elevation;
            temp[0] = first;
            temp[elevation.length - 1] = last;

        }
        let data = {
            labels: resolution,
            datasets: [
                {
                    label: 'Elevation Data Visualization',
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: temp
                }
            ]
        };
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>

                            <div ref={"map"} style={{ width: "auto", height: "450px" }}></div>

                            <Select options={options} onChange={this.onChangeHeight.bind(this)}></Select>
                            <div id={"elevation_comp"} style={{ width: "450px", maxWidth: "450px" }}>
                                <Segment padded>
                                    <Line data={data} redraw />
                                </Segment>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

export default MapComponent;