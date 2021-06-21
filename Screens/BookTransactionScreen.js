import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barCode-scanner';

import db from "../config"
import firebase from "firebase"

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId: '',
            scannedData: '',
            buttonState: 'normal',
            transactionMessage: '',
        }
    }
    getCameraPermissions = async() =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: 'clicked',
            scanned: false
        })
    }

    handelBarCodeScanned = async({type, data}) => {
        const {buttonState} = this.state
        if(buttonState === "BookId"){
            this.setState({ 
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'})
        }
        else if(buttonState === "StudentId"){
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'})
        }
        
        
    }
    iniateBookIssue = async() => {
        db.collection("transactions").add({
            'studentId': this.state.scannedStudentId, 
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Issue",
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.Fieldvalue.increment(1)
        })
        
    }

    iniateBookReturn = async() => {
        db.collection("transactions").add({
            'studentId': this.state.scannedStudentId, 
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': "Return",
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.Fieldvalue.increment(-1)
        })
      
    }
    handleTransaction = async() => {
        var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book = doc.data()
            if(book.bookAvailability){
                this.iniateBookIssue();
                transactionMessage = "Book Issued"
                alert(transactionMessage);
            }
            else {
                this.iniateBookReturn();
                transactionMessage = "Book Returned"
                alert(transactionMessage);
            }
        })
    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState === "clicked" && hasCameraPermissions){
            return(
                <BarCodeScanner
                    onBarCodeScanned = { scanned ? undefined:this.handelBarCodeScanned}
                    style = {StyleSheet.absoluteFillObject}/>
                
            );
        }
        else if(buttonState === "normal"){
            return(
                <KeyboardAvoidingView style = {styles.container}>
                    <View>
                        <Image source = {require("../assets/booklogo.jpg")}
                        style = {{width: 200, height: 200}}/>
                        <Text style ={{textAlign: 'center', fontSize: 30}}>Wily</Text>
                    </View>
                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox}
                        placeholder = "BookID"
                        onChangeText = {text => this.setState({scannedBookId:text})} 
                        value = {this.state.scannedBookId}/>
                        <TouchableOpacity style ={styles.scanButton} 
                        onPress = {()=> {
                            this.getCameraPermissions("BookID")
                        }}>
                            <Text style = {styles.buttontext}>Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox}
                        placeholder = "StudentID" 
                        onChangeText = {text => this.setState({scannedStudentId:text})}
                        value = {this.state.scannedStudentId}/>
                        <TouchableOpacity style ={styles.scanButton} 
                        onPress = {()=> {
                            this.getCameraPermissions("StudentID")
                        }}>
                            <Text style = {styles.buttontext}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style = {styles.transactionAlert}>{this.state.transactionMessage}</Text>
                    <TouchableOpacity style = {styles.submitButton}
                    onPress = {async() => {
                        var transactionMessage = await this.handleTransaction;
                        this.setState({
                            scannedBookId: '',
                            scannedStudentId: ''
                        })
                    }}><Text style = {styles.submitButtonText}>Submit</Text></TouchableOpacity>
                   
                </KeyboardAvoidingView>
            )
        }
    }
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        justifyContent: 'center',
        alignItems : 'center',

    }, 

    displayText : {
        fontSize : 15,
        textDecorationLine : 'underline', 

    },

    scanButton : {
        backgroundColor : 'blue',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,

    },

    buttontext: {
        fontSize : 20,

    },

    inputView:{
        flexDirection:'row',
        margin:20,

    },

    inputbox:{
        width:200,
        height:40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20,

    },

    submitButton : {
        backgroundColor: '#fbc02d',
        width:100,
        height:50
    },

    submitButtonText : {
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight : "bold",
        color : 'white'
    }


});