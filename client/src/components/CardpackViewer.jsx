import React from 'react';
import axios from 'axios';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { TextField, SelectField, RaisedButton, FlatButton, DropDownMenu, MenuItem } from 'material-ui';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import time from 'time-converter';
import cardpackFileHandler from '../helpers/cardpackFileHandler';
import fileSelect from 'file-select';

class CardpackViewer extends React.Component {
  constructor (props) {
    super(props);
    this.socket = this.props.socket;
    this.cardpackId = this.props.cardpackId;
    this.addCards = this.addCards.bind(this);
    this.addCurrentCard = this.addCurrentCard.bind(this);
    this.handleNewSelect = this.handleNewSelect.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.downloadStringifiedCards = this.downloadStringifiedCards.bind(this);
    this.uploadStringifiedCards = this.uploadStringifiedCards.bind(this);
    this.state = {
      currentUser: null,
      cards: [],
      newCardName: '',
      newCardType: 'white',
      newCardAnswerFields: 1,
      cardpack: undefined
    };
    if (props.liveUpdateTime === true) {
      setInterval(this.forceUpdate.bind(this), 1000); // Refreshes the 'created at' relative time of all cardpacks
    }
    axios.get('/api/currentuser')
      .then((response) => {
        let currentUser = response.data;
        this.setState({currentUser});
      });
    this.fetchCurrentCardpack();
    this.fetchCards();

    this.socket.on('cardcreate', (cardString) => {
      let card = JSON.parse(cardString).card;
      this.renderNewCard(card);
    });
    this.socket.on('carddelete', (cardString) => {
      let card = JSON.parse(cardString).card;
      this.unrenderOldCard(card);
    });
  }

  handleNewSelect (e, index, newCardType) {
    this.setState({newCardType});
  }
  handleInputChange (property, e) {
    let stateChange = {};
    stateChange[property] = e.target.value;
    this.setState(stateChange);
  }
  changeAnswerField = (event, index, value) => {
    this.setState({newCardAnswerFields: value});
  }
  handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.addCurrentCard();
    }
  }

  renderNewCard (card) {
    this.setState({cards: [...this.state.cards, card]});
  }
  unrenderOldCard (card) {
    this.setState({cards: this.state.cards.filter((cardCurrent) => {
      return card.id !== cardCurrent.id;
    })});
  }

  fetchCurrentCardpack () {
    axios.get('/api/cardpacks/' + this.cardpackId)
      .then((response) => {
        let cardpack = response.data;
        this.setState({cardpack});
      })
      .catch(() => {
        this.setState({cardpack: null});
      });
  }
  fetchCards () {
    if (this.cardpackId) {
      axios.get('/api/cards/' + this.cardpackId)
        .then((response) => {
          let cards = response.data;
          this.setState({cards});
        })
        .catch((error) => {
          this.setState({cardpack: null});
        });
    }
  }

  addCurrentCard () {
    if (this.state.newCardName) {
      this.addCards([{
        text: this.state.newCardName,
        type: this.state.newCardType,
        answerFields: this.state.newCardAnswerFields
      }]);
      this.setState({newCardName: ''});
    }
  }
  addCards (cards) {
    return axios.post('/api/cards/' + this.cardpackId, cards);
  }
  removeCard (card) {
    axios.delete('/api/cards/' + card.id);
  }

  downloadStringifiedCards () {
    let download = (filename, text) => {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    // Start file download.
    download(this.state.cardpack.name, cardpackFileHandler.stringify(this.state.cards));
  }
  uploadStringifiedCards () {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      fileSelect({
        accept: 'text/*',
        multiple: false
      })
        .then((textFile) => {
          console.log('textFile', textFile);
          let reader = new FileReader();
          reader.onload = (result) => {
            let text = result.currentTarget.result;
            console.log(cardpackFileHandler.parse(text));
            this.addCards(cardpackFileHandler.parse(text));
          };
          reader.readAsText(textFile);
        });
    } else {
      // TODO - Handle properly if browser does not support file uploading
    }
  }

  render () {
    const styles = {
      root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      },
      gridList: {
        width: 'auto',
        height: 500,
        overflowY: 'auto'
      }
    };

    if (this.state.cardpack === null) {
      return (
        <div className='panel'>Cardpack does not exist</div>
      );
    }

    let isOwner = this.state.currentUser && this.state.cardpack && this.state.cardpack.owner && this.state.currentUser.id === this.state.cardpack.owner.id;
    let cardAdder;
    if (isOwner) {
      cardAdder = (<div className='panel'>
        <TextField onKeyPress={this.handleKeyPress} floatingLabelText='Name' type='text' value={this.state.newCardName} onChange={this.handleInputChange.bind(this, 'newCardName')} /><br/>
        <DropDownMenu value={this.state.newCardType} onChange={this.handleNewSelect}>
          <MenuItem value={'white'} primaryText='White' />
          <MenuItem value={'black'} primaryText='Black' />
        </DropDownMenu>
        <SelectField
          floatingLabelText="Answer Fields"
          value={this.state.newCardAnswerFields}
          onChange={this.changeAnswerField}
        >
          <MenuItem value={1} primaryText="One" />
          <MenuItem value={2} primaryText="Two" />
          <MenuItem value={3} primaryText="Three" />
        </SelectField>
        <RaisedButton label='Create Card' disabled={!this.state.newCardName} className='btn' onClick={this.addCurrentCard} />
      </div>);
    }
    let cards = [];

    this.state.cards.forEach((card, index) => {
      let cardElements = [];
      cardElements.push(
        <CardHeader
          title={card.text + (card.answerFields && card.answerFields > 1 ? ' - ' + card.answerFields + ' card answer' : '')}
          subtitle={'Created ' + time.stringify(card.createdAt, {relativeTime: true})}
          key={0}
        />
      );

      if (isOwner) {
        cardElements.push(
          <CardActions key={1}>
            <FlatButton label='Delete' onClick={this.removeCard.bind(this, card)} />
          </CardActions>
        );
      }

      let cardWrapper = card.type === 'black' ? (
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <Card className='card'>;
            {cardElements}
          </Card>
        </MuiThemeProvider>
      ) : (
        <Card className='card'>;
          {cardElements}
        </Card>
      );

      cards.push(<GridTile key={index}>{cardWrapper}</GridTile>);
    });

    return (
      <div className='panel'>
        <div>{this.state.cardpack ? this.state.cardpack.name : 'Loading...'}</div>
        {isOwner ? cardAdder : null}
        <FlatButton label={'Download'} onClick={this.downloadStringifiedCards} />
        <FlatButton label={'Upload'} onClick={this.uploadStringifiedCards} />
        <GridList children={cards} cols={4} cellHeight='auto' style={styles.gridList} />
      </div>
    );
  }
}

export default CardpackViewer;