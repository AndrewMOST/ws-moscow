import { grey } from '@material-ui/core/colors/';
import { createMuiTheme } from '@material-ui/core/styles';

// const orange = "#FF5F4C";

const Theme = createMuiTheme({
    typography: {
      fontFamily: 'Roboto',
    },
    palette: {
      primary: {
        main: '#6abfef',
        contrastText: '#fff',
      },
      secondary: grey,
    }
});

export default Theme