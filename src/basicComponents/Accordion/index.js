import React from "react";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const AccordionCpn = (props) => {
  const {
    styleHeader = {},
    expanded = false,
    labelHeader = "",
    onClick = () => {},
    content,
    expandedCheck = "",
  } = props;
  return (
    <Accordion className="mb-2 w-100" expanded={expanded}>
      <AccordionSummary
        // onClick={() => {
        //   handExpandedRight("expandedRight1");
        // }}
        onClick={onClick}
        expandIcon={<ExpandMoreIcon />}
        style={styleHeader}
      >
        <Typography>{labelHeader}</Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};

export default AccordionCpn;
