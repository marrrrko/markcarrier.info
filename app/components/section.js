import React from 'react'
import Skeleton from '@material-ui/lab/Skeleton'
import Typography from '@material-ui/core/Typography'
import ReactMarkdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    rightHangingDate: {
        marginRight: theme.spacing(1),
        display: "block",
        float: "right"
    },
    bannerImage: {
        marginTop: "5px",
        marginBottom: "15px"
    }
}))

export default function Section(props) {
    const classes = useStyles()

    if(!props.section)
        return (<div><Skeleton /><Skeleton variant="rect" height={400} /><Skeleton/><Skeleton/><Skeleton/><Skeleton/></div>)
    
    let level = props.level || 1
    let headerLevel = "h" + level
    return (
        <>
            {props.section.date != undefined && (
                <RightHangingDate dateText={props.section.date} />
            )}
            <Typography variant={headerLevel} paragraph={true}>{props.section.title}</Typography>            
            <Typography component="div">
                {props.section.introBlock != undefined && (
                    <Typography variant="body1" paragraph={true}>{props.section.introBlock}</Typography>
                )}
                
                {props.section.image != undefined && (
                    <img 
                        className={classes.bannerImage}
                        src={props.section.image.url}
                        width="100%" alt={props.section.image.alt} 
                        />
                )}
                
                {props.section.content != undefined && (
                    <ReactMarkdown source={props.section.content} />
                )}
                
            </Typography>
            {props.section.sections != undefined && props.section.sections.map(
                (section) => <Section section={section} key={section.title} level={level + 1} />
            )}
        </>)
}

function RightHangingDate(props) {
    const classes = useStyles()
    
    return <Typography className={classes.rightHangingDate}>{props.dateText}</Typography>
}
