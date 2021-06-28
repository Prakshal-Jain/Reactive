import React from 'react';
import "./checkbox.css";

class Checkbox extends React.Component {
    clickHandle = () => {
        if(this.props.checked){
            this.props.onUncheck()
        }
        else{
            this.props.onCheck()
        }
    }
    render() {
        if(this.props.isActive){
            return(
                <div>
                    <div onClick={this.clickHandle}>
                        <i className = {`square-icon fa ${this.props.checked ? "fa-check active" : "inactive"}`}></i>
                        <label className="check_label">{this.props.label }</label><br/>
                    </div>
                </div>
            )
        }
        else{
            return(
                <div>
                    <div>
                        <i className = {"square-icon fa inactive"}></i>
                        <label className="check_label" color="#6c757d"><label dangerouslySetInnerHTML={{ __html: this.props.label }} /></label><br/>
                    </div>
                </div>
            )
        }
    }
}
export default Checkbox