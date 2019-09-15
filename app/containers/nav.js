import { connect } from 'react-redux'
import MarkNav from '../components/nav'
import { toggleLight } from '../state/actions'

const mapDispatchToProps = {
    toggleLight: toggleLight
}

export default connect(
    null,
    mapDispatchToProps
)(MarkNav)