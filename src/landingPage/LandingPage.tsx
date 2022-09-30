import React from "react";
import "./LandingPage.scss";
import { Link } from "react-router-dom";

var ProjectList = [
  {
    "title":"Calculator",
    "image":"images/calculator.png",
    "description":"The Calculator app has been built using React, HTML and SCSS",
    "route":"/calculator"
  },
  {
    "title":"Mars Mission",
    "image":"images/mars-mission.png",
    "description":"I contributed to the Landing Page and the Fun Facts page of this group project",
    "route":"/mars-mission"
  },
  {
    "title":"Go",
    "image":"images/baduk.png",
    "description":"Go app implements everything but the Ko rule",
    "route":"/baduk"
  } 
];

export const LandingPage: React.FunctionComponent = () => {

  return ( 
    <div className="button--menu">
    {ProjectList.map( Project => 
      <Link to={{pathname: Project.route}}>
        <div className="button--border">
          <div className="button--actual">
            <div className="button--content">
              {Project.title}
              <img src={Project.image} className="button--image" />
              <p className="button--text">{Project.description}</p>
            </div>
          </div>
        </div>
      </Link>)}
    </div>
    );
}
