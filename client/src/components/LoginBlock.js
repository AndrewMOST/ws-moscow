import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, Typography, Input, InputLabel, FormHelperText, FormControl } from '@material-ui/core/';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
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
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        '& button': {
            'text-align': 'right',
            margin: '1rem 0',
        }
    },
    centered: {
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
    }
};
class LoginBlock extends React.Component {

    constructor(props){
        super(props);
        this.state = {
          login: '',
          password: '',
          error: false,
          redirect: false
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        axios.post('login', {
            address: this.state.login,
            password: this.state.password,
          })
          .then(response => {
            console.log(response);
            if (response.data === true){
                this.setState({redirect: true});
            }
            else{
                this.setState({error: true});
            }
          })
    };

    handleChange(e) {
        const {name, value} = e.target;
        console.log(name);
        this.setState({
          [name]: value,
        });
        if (this.state.error){
            this.setState({error: false});
        }
    };

    render() {
        const { classes } = this.props;
        if (this.state.redirect === true){
            return <Redirect to={{pathname: '/main'}} push/>;
        }
        return (
                <form className={classes.container} noValidate autoComplete="off">
                    <Card className={classes.card}>
                    <CardContent>

                        <Typography variant="display1" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                            Sign In
                        </Typography>

                        <FormControl className={classes.textField} error={ this.state.error } aria-describedby="login-error-text" fullWidth required>
                            <InputLabel htmlFor="login-error">Login</InputLabel>
                            <Input id="login-error" value={this.state.login} name="login" autoComplete="current-login" type="text" maxLength="64" onChange={this.handleChange.bind(this)} />
                            { this.state.error ? <FormHelperText id="login-error-text">Wrong credentials</FormHelperText> : null }
                        </FormControl>
                        <FormControl className={classes.textField} error={ this.state.error } aria-describedby="password-error-text" fullWidth required>
                            <InputLabel htmlFor="password-error">Password</InputLabel>
                            <Input id="password-error" value={this.state.password} name="password" autoComplete="current-password" type="password" maxLength="64" onChange={this.handleChange.bind(this)} />
                            { this.state.error ? <FormHelperText id="password-error-text">Wrong credentials</FormHelperText> : null }
                        </FormControl>

                    </CardContent>
                    <CardContent>
                        <Button onClick={this.handleClick.bind(this)} variant="contained" color="primary" size="medium" style={{ marginLeft: "auto", display: "flex" }}>
                            Sign In
                        </Button>
                    </CardContent>
                    </Card>

                </form>
        );
    }
}

LoginBlock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(LoginBlock) && withStyles(styles)(LoginBlock);