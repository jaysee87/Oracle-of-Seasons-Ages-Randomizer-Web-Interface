import React, { Component } from 'react';
import toTitleCase from '../Utility/titlecase';

class Log extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedLocation: "",
      selectedSubLocation: "",
      locations: {},
      items: {},
      companion: "Ricky"
    }
    this.locationClick = this.locationClick.bind(this);
    this.itemSelect = this.itemSelect.bind(this);
    this.displayItemName = this.displayItemName.bind(this);
  }

  locationClick(e, key, val){
    e.preventDefault();
    this.setState({
      [key]: val
    })
  }

  displayItemName(item){
    // If from generated seed, log will be provide a string
    // If plando, will be an object that contains object with name and id
    if (typeof(item) === 'string'){
      return toTitleCase(item);
    } else {
      return toTitleCase(item.name);
    }
  }

  itemSelect(e,obj){
    e.preventDefault();
    const {selectedLocation, selectedSubLocation} = this.state;
    const newLocations = {
      ...this.state.locations
    }
    const newItems = {
      ...this.state.items
    }
    if (selectedLocation === '' || selectedSubLocation === ''){
      return
    }
    // If replacing an already placed item, need to add this item back to item pool
    if (newLocations[selectedLocation][selectedSubLocation] !== ''){
      newItems.items[newLocations[selectedLocation][selectedSubLocation].index].placed = false;
    }    
    newLocations[selectedLocation][selectedSubLocation] = obj;
    if (this.state.selectedLocation !== "Seed Trees") {
      newItems.items[obj.index].placed = true;
    }

    this.setState({
      locations: newLocations,
      items: newItems,
      })
  }

  componentWillMount(){
    if (['ooa', 'oos'].includes(this.props.game)){
      const locations = require(`./${this.props.game}/locations.json`);
      const items = require(`./${this.props.game}/items.json`);
      this.setState({
        selectedLocation: locations.keys[0],
        locations: locations,       
        items: items 
      });
    } else {
      this.props.history.push('/randomize')
    }
  }

  render() {
    const {mode} = this.props;
    const tableClass = ['table', 'table-striped', 'table-sm']
  
    const locationList = this.state.locations.keys.map(key=>{
      const cName = key === this.state.selectedLocation ? 'btn btn-outline-primary p-4' : 'p-4';
      return <a href="/" className={cName} id={key} key={key} onClick={e => this.locationClick(e, 'selectedLocation', key)}>{key}</a>
    })
    const itemList = Object.keys(this.state.locations[this.state.selectedLocation]).map(key => {
      let item = this.state.locations[this.state.selectedLocation][key];
      if (item.length < 1) {
        item = "<Not Set>"
      };

      const cNameRow = key === this.state.selectedSubLocation ? 'table-info' : '';
      return (
        <tr key={key} id={key} onClick={e => this.locationClick(e, 'selectedSubLocation', key)} className={cNameRow}>
          <td>{key}</td>
          <td>{this.displayItemName(item)}</td>
        </tr>
      )
    })

    let itemTable;
    itemTable = (
      <table className={tableClass.join(' ')}>
        <thead>
          <tr>
            <th>Location</th>
            <th>Item</th>
          </tr>
        </thead>
        <tbody>
          {itemList}
        </tbody>
      </table>
    )

    if (mode === 'plan'){
      tableClass.push('col-9');
      // New copy to avoid changing component's state
      let categoryArray = this.state.items.keys.map(key=>key);
      if  (this.state.items.specials.includes(this.state.selectedLocation)){
        categoryArray.unshift('Dungeon Items')
       } else if (this.state.selectedLocation === "Seed Trees") {
         categoryArray = ["Seeds"]
       }


      const itemsToPlace = categoryArray.map((category,i) => {
        const offset = i * -48;
        const filterkey = category === 'Dungeon Items' ? this.state.selectedLocation : category;
        const categoryItems = this.state.items.items.filter( item => item.category === filterkey)
        const itemSelects = categoryItems
          .filter(item => !item.placed)
          // .map(item => <a href="/" key={`${item.name}-${item.index}`} onClick={e=>this.itemSelect(e, item)} className="dropdown-item">{item.name}</a>)
          .map(item =>
            <option key={`${item.name}-${item.index}`} onClick={e=>this.itemSelect(e, item)}>{toTitleCase(item.name)}</option>)
        // return (          
        //   <div key={category} name={category} id={`${category}-items`} className='dropleft'>
        //     <button className="btn btn-info btn-block dropdown-toggle mb-2" type="button" data-toggle="dropdown" data-offset={`${offset},10`} data-boundary="window">{category}</button>
        //     <div className="dropdown-menu mb-5" aria-labelledby="dropdownMenuButton">
        //       {itemSelects}
        //     </div>
        //   </div>
        // )
        return (
          <div key={category} className="form-group">
            <h5>{category}</h5>
            <select  id={category} className='form-control' multiple size="2">
              {itemSelects}
            </select>
          </div>
        )
      })

      itemTable = (<div className="row">
        <table className={tableClass.join(' ')}>
          <thead>
            <tr>
              <th>Location</th>
              <th>Item</th>
            </tr>
          </thead>
          <tbody>
            {itemList}
          </tbody>
        </table>
        <div className="col-3">
          {itemsToPlace}
        </div>
      </div>)
    }

    return (
      <div className="card">
        <div className="card-header d-flex flex-wrap">
          {locationList}
        </div>
        <div className="card-body">
        {itemTable}
        </div>
      </div>
    )
  }
}

export default Log;
