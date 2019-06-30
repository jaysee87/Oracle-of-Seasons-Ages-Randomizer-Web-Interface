import React, {Component} from 'react'
import Palettes from '../Utility/palettes';
import axios from 'axios';
const palettes = Palettes();


// {
//   "name": "link",
//   "defaultPalette": 0,
//   "display": "Link",
//   "separatePatches": false
// },

class Sprite extends Component {
  constructor(props){
    super(props);
    this.state = {
      sprite: 0
    }
    this.setOptionsP = this.setOptionsP.bind(this);
    this.setOptionsS = this.setOptionsS.bind(this);
    this.setSprite = this.setSprite.bind(this);
    this.setPalette = this.setPalette.bind(this);
  }

  setSprite(e,i){
    e.preventDefault();
    e.target.value = i;
    this.props.setSprite(e, "selectedSprite");
    this.setState({
      sprite: i
    })
  }

  setPalette(e,spriteLink){
    fetch(`/img/${spriteLink}.gif`)
      .then(res =>{
        console.log(res.data);
        // this.props.setSprite(e,"selectedPalette")
      })
  }

  setOptionsP(){
    return ['Green', 'Blue', 'Red', 'Gold', 'Blue (Inverted)', 'Red (Inverted)'].map((color,i)=> (<option key={color} value={i}>{color}</option>))
  }

  setOptionsS(){
    /*
    *   Each sprite has the following properties:
    *     name - string representing the filename
    *     defaultPalette: Number respresenting the default palette index used by the sprite
    *     display - string representing name displayed on site
    *     separatePatches - Boolean representing if there are animation patches in addition to graphics patches and will be game specific
    */
    return this.props.sprites.map((sprite, i) =>{
      return (
        <a key={sprite.name} value={sprite.name} className="dropdown-item" href='/' onClick={e=> this.setSprite(e,i)}>
          <img src={`/img/${sprite.name}.gif`} alt={`${sprite.display}-Sprite`} height="32" className="mr-4"/>
          <span className="font-weight-bold">{sprite.display}</span>
        </a>
      )
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if (this.state.sprite !== prevState.sprite){
      const e = {target: {value: this.props.sprites[this.state.sprite].defaultPalette}};
      console.log(e);
      this.props.setSprite(e, 'selectedPalette')
    }
  }

  render(){
    const paletteOptions = this.setOptionsP();
    const spriteOptions = this.setOptionsS();
    const spriteLink = this.props.sprites[this.state.sprite].name;

    return (
      <div className="mt-4 media">
        <img src={`/img/${spriteLink}.gif`}  alt="Link-Sprite" className="mr-3" id="link-sprite"></img>
        <div className="media-body">
          <h4>Link Sprite Selection</h4>
          <div className="dropdown">
            <button className="btn btn-primary btn-block dropdown-toggle" type="button" id="spriteDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {this.props.sprites[this.state.sprite].display}
            </button>
            <div className="dropdown-menu" aria-labelledby="spriteDropdown">
              {spriteOptions}
            </div>
          </div>
          <h4>Sprite Palette Selection</h4>
          <div className="input-group">
            <select className="custom-select" name="paletteIndex" id="paletteIndex" value={this.props.selectedPalette} onChange={e=> this.setPalette(e,spriteLink)}>
              {paletteOptions}
            </select>
          </div>
        </div>      
      </div>
    )
  }
}

export default Sprite;
