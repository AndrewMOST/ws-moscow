import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, Typography, Input, InputLabel, FormHelperText, FormControl, Fade } from '@material-ui/core/';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

const styles = {
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 100 + '%',
        maxWidth: 500,
        alignItems: 'center'
    },
    card: {
        width: 100 + '%',
        height: 'fit-content',
        margin: '0 1rem 0 1rem'
    },
    card_1: {
        width: 100 + '%',
        height: 'fit-content',
        margin: '1rem 1rem 0 1rem'
    },
    title: {
        marginBottom: 16,
    },
    pos: {
        marginBottom: 12,
    },
    textField: {
        marginBottom: 0.5 + 'rem',
    },
    link: {
        '&:hover': {
            textDecoration: 'underline',
        }
    },
    button: {  
        'flex-direction': 'column',
        'justify-content': 'center',
        '& button': {
            'text-align': 'left',
            margin: '3rem 0',
        }
    },
    centered: {
        display: 'flex',  
        'flex-direction': 'column',
        'justify-content': 'center',
    }
};
class RegisterBlock extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            key: '',
            login: '',
            password: '',
            privatekey: '',
            checked: false
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        axios.post('registration',
            {
                password: this.state.password, 
            })  
          .then(response => {
            this.setState({login: response.data.address, password: response.data.password, privatekey: response.data.privatekey, checked: true});
          })
          .catch(err => {
            console.log(err);   
          })
    };

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
          [name]: value
        });
    };

    render() {
        const { classes } = this.props;
        const { checked, login, password, privatekey } = this.state;
        return (
                <form className={classes.container} noValidate autoComplete="off">
                    <Card className={classes.card}>
                    <CardContent>
                        
                    <Typography variant="display1" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                        Sign Up
                    </Typography>

                    <FormControl className={classes.textField} error={ this.state.error } aria-describedby="login-error-text" fullWidth required>
                            <InputLabel htmlFor="passwordl-error">Password</InputLabel>
                            <Input id="passwordl-error" value={this.state.password} name="password" autoComplete="current-password" type="text" maxLength="64" onChange={this.handleChange.bind(this)} />
                            { this.state.error ? <FormHelperText id="password-error-text">Wrong credentials</FormHelperText> : null }
                    </FormControl>

                    </CardContent>
                    <CardContent>
                        <Button onClick={this.handleClick.bind(this)} variant="contained" color="primary" size="medium" style={{ marginRight: "auto", display: "flex" }}>
                            Sign Up
                        </Button>
                    </CardContent>
                    </Card>
                    <br/>
                    <Fade in={checked}>
                    <Card className={classes.card_1}>
                        <CardContent>
                        <Typography variant="title" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                            Address/Login: <Typography  gutterBottom color="secondary">{login}</Typography>
                        </Typography>
                        <Typography variant="title" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                            Password: <Typography  gutterBottom color="secondary">{password}</Typography>
                        </Typography>
                        <Typography variant="title" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                            PrivateKey: <Typography  gutterBottom color="secondary">{privatekey}</Typography>
                        </Typography>
                        </CardContent>
                    </Card>
                    </Fade>


                </form>
        );
    }
}

RegisterBlock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(RegisterBlock) && withStyles(styles)(RegisterBlock);