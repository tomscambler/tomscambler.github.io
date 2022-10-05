import React from "react";
import "./LandingPage.scss";
import { Link } from "react-router-dom";

var ProjectList = [
  {
    "title":"Calculator",
    "image":"images/calculator.png",
    "description":"The Calculator app has been built using Typescript, React, HTML and SCSS",
    "route":"/calculator"
  },
  {
    "title":"Mars Mission",
    "image":"images/mars-mission.png",
    "description":"I contributed to the Landing Page, Floating Menu and Fun Facts page of this group project",
    "route":"/mars-mission"
  },
  {
    "title":"Go",
    "image":"images/go-game.png",
    "description":"Go app to play against your friends, built using Typescript, React, HTML and SCSS",
    "route":"/go-game"
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
