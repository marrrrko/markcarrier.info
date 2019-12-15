import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import About from '../components/about'

const mapStateToProps = function(state) {
    return {
        about: state.profile && state.profile.about,
        receivedImages: state.receivedImages
    }
}

export default withRouter(connect(
    mapStateToProps
)(About))