import React from "react";
import { Header } from "semantic-ui-react";

class HeaderComponent extends React.Component{
    render(){
        return(
            <Header as='h3' block>
                GIS With React
            </Header>
        )
    }
}
export default HeaderComponent;
