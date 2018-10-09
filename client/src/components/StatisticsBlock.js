import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, Typography, Fade } from '@material-ui/core/';
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
class StatisticsBlock extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            orel: 0,
            reshka: 0,
            state: '',
            checked: false
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        axios.post('throw')  
          .then(response => {
            this.setState({state: response.data.state, checked: true});
          })
          .catch(err => {
            console.log(err);   
          })
        
        axios.get('statistics')
        .then(res => {
        this.setState({ orel: res.data.orel, reshka: res.data.reshka });
        });
    };
    componentDidMount() {
        axios.get('statistics')
          .then(res => {
            this.setState({ orel: res.data.orel, reshka: res.data.reshka });
          });
    }
    render() {
        const { classes } = this.props;
        return (
            <div className="main_windows">
                <form className={classes.container} noValidate autoComplete="off">
                    <Card className={classes.card}>
                    <CardContent>
                    <Typography variant="display1" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                        Statistics
                    </Typography>
                    Орлов: {this.state.orel}<br/>
                    Решек: {this.state.reshka}<br/>
                    Сумма орлов и решек: {(this.state.orel + this.state.reshka)}<br/>
                    Отношение решек от общего количетва выпаших: {((this.state.orel + this.state.reshka)/this.state.reshka)}<br/>
                    Отношение орлов от общего количетва выпаших: {((this.state.orel + this.state.reshka)/this.state.orel)}<br/>
                    </CardContent>
                    </Card>
                </form>
                <form className={classes.container} noValidate autoComplete="off">
                    <Card className={classes.card}>
                    <CardContent>
                        
                    <Typography variant="title" gutterBottom color="secondary" style={{ marginBottom: 0, fontWeight: "bold" }}>
                        Брось монетку!
                    </Typography>
                    <CardContent>
                    <Button onClick={this.handleClick.bind(this)} variant="contained" color="primary" size="medium" style={{ marginRight: "auto", display: "flex" }}>
                        Подбросить
                    </Button>
                    </CardContent>
                    </CardContent>
                    </Card>
                    <Fade in={this.state.checked}>
                    <Card className={classes.card_1}>
                        <CardContent>
                        {this.state.state}
                        </CardContent>
                    </Card>
                    </Fade>
                    
                </form>
            </div>
        );
    }
}

StatisticsBlock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(StatisticsBlock) && withStyles(styles)(StatisticsBlock);