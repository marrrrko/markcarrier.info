import { connect } from 'react-redux'
import MarkBulb from '../components/bulb'

const mapStateToProps = function(state) {
    return {
        light: state.lightsOn
    }
}
    
export default connect(
    mapStateToProps
)(MarkBulb)
