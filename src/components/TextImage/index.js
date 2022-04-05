import React, { useState, useRef, useEffect } from "react";

export default function TextImage(props) {
    const { style, className } = props
   return (
       <div className={className} style={style}>Image</div>
   )
}