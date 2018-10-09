import React, { Component } from "react";
import RegisterBlock from '../components/RegisterBlock';
import LoginBlock from "../components/LoginBlock";

export default class Register extends Component{
    render(){
        return(
            <div className="centered_block">
                <RegisterBlock />
                <LoginBlock />
            </div>
        );
    }
}