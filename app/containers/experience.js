import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Experience from '../components/experience'

const mapStateToProps = function(state) {
    return {
        experience: state.profile && state.profile.experience,
        receivedImages: state.receivedImages
    }
}

export default withRouter(connect(
    mapStateToProps
)(Experience))