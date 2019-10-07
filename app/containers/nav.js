import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import MarkNav from '../components/nav'
import { toggleLight } from '../state/actions'

const mapDispatchToProps = {
    toggleLight: toggleLight
}

export default withRouter(connect(
    null,
    mapDispatchToProps
)(MarkNav))