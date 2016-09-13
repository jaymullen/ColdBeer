import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  Alert,
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
  View
} from 'react-native';
var TimerMixin = require('react-timer-mixin');
var Sound = require('react-native-sound');
var limbo = new Sound('limbo.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
  } else { // loaded successfully
    console.log('duration in seconds: ' + limbo.getDuration() +
        'number of channels: ' + limbo.getNumberOfChannels());
  }
});

class beer extends Component {

  render() {
    return (
      <Image style={styles.beer} source={require('./img/beer-can.jpg')} >
        <Text style={styles.title}>warm beer?!</Text>
        <ColdBeerForm />
      </Image>
    );
  }

}

var ColdBeerForm = React.createClass({
  mixins: [TimerMixin],
  getInitialState: function() {
    return {
      freezerTemp: "-20",
      roomTemp: "20",
      drinkabilityTemp: "0",
      time: "0",
      readableTime: null,
      intervalId: null
    };
  },
  changeFreezerTemp: function(event) {
    this.setState({freezerTemp: event });
  },
  changeDrinkabilityTemp: function(event) {
    this.setState({drinkabilityTemp: event });
  },
  changeRoomTemp: function(event) {
    this.setState({ roomTemp: event });
  },
  setTimer: function() {
    var timerTime = this.getColdBeerTime();
    this.clearCurrentInterval();
    this.makeNoise();
    this.setState( { time : timerTime.toString()  } );
    var id = this.setInterval( () => {
      if( this.state.time == 0){
        this.clearCurrentInterval();
        this.stopNoise();
      } else {
        this.setState({ time : this.state.time - 1});
        this.setState({ readableTime : this.formatTime(this.state.time)});
      }
    }, 1000);
    this.setState({ intervalId : id });
  },
  makeNoise: function(){
    limbo.setVolume(1);
    limbo.setNumberOfLoops(-1);
    // Play the sound with an onEnd callback
    limbo.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });
  },
  stopNoise: function(){

    limbo.stop();
    limbo.release();
  },
  clearCurrentInterval: function(){
    if(this.state.intervalId){
      this.clearInterval(this.state.intervalId);
    }
  },
  formatTime: function( time ) {
    var min = Math.floor(time/60);
    var sec = Math.round( ((time/60)%1) * 60);
    if( sec < 10 ){
      sec = "0"+sec;
    }
    return min + ':' + sec;
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.label} >Freezer Temp</Text>
        <TextInput
          style={styles.input}
          defaultValue={"-20"}
          onChangeText={(event) => this.changeFreezerTemp(event)}
        />
        <Text style={styles.label} >Drinkability Temp</Text>
        <TextInput
          style={styles.input}
          defaultValue={"0"}
          onChangeText={(event) => this.changeDrinkabilityTemp(event)}
        />
        <Text style={styles.label} >Room Temp</Text>
        <TextInput
          style={styles.input}
          defaultValue={"20"}
          onChangeText={(event) => this.changeRoomTemp(event)}
        />
        <TouchableElement  onPress={this.setTimer}>
          <View style={styles.button}>
            <Text style={styles.buttonText} >Partyin</Text>
          </View>
        </TouchableElement>
        <Text style={styles.timer}> {this.state.readableTime} </Text>
      </View>
    );
  },
  getColdBeerTime: function(){
    var roomTemp = parseInt(this.state.roomTemp);
    var drinkability = parseInt(this.state.drinkabilityTemp);
    var freezerTemp = parseInt(this.state.freezerTemp);

    var specificHeat = 4184;
    var thermalConductivityAl = 205;
    var thermalConductivityBeer = .6;
    var mass12oz = (400/1000);
    var height12oz = (4.83*2.54)/100;
    var diameter12oz = (2.6*2.54)/100;
    var thicknessAl = .0001;
    var thicknessBeer = diameter12oz/2;
    var freezerEff = 10.7 ; //Ability of Freezer to cool things, this number is highly variable it seems, see page 16: https://hal-sde.archives-ouvertes.frhal-00583230document
    var heat = mass12oz * specificHeat * (roomTemp - drinkability);
    var areaCan = Math.PI * diameter12oz * height12oz + 2*(Math.PI*Math.pow(thicknessBeer, 2) );

    var time = ( (1 / heat) * areaCan * freezerEff * (roomTemp - freezerTemp) * ( (thermalConductivityAl/thicknessAl) + (thermalConductivityBeer / thicknessBeer) ) );

    return Math.round(time);
    // return 5;
  },
});

const styles = StyleSheet.create({
  timer: {
    fontSize: 20,
    marginTop: 60,
    marginLeft: 55,
  },
  button: {
    borderWidth: 1,
    borderColor: 'green',
    backgroundColor: 'green',
  },
  buttonText: {
    fontSize:30,
  },
  title: {
    fontSize: 30,
    marginTop: 20,
    marginBottom:200,
  },
  input: {
    height: 35,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
  },
  label: {
    fontSize: 10
  },
  beer: {
    flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor:'transparent',
    alignItems: 'center',
  },
  container: {
    width: 180,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('beer', () => beer);
