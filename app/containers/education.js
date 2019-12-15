import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Education from '../components/education'

const mapStateToProps = function(state) {
    return {
        education: state.profile && state.profile.education,
        receivedImages: state.receivedImages
    }
}

export default withRouter(connect(
    mapStateToProps
)(Education))