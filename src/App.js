import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import metadata from './data/metadata.json';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.model = null;
    this.loadModel = this.loadModel.bind(this);
    this.loadMetaData = this.loadMetaData.bind(this);
    this.celebRequest = this.celebRequest.bind(this);
    this.padSequences = this.padSequences.bind(this);
    this.predict = this.predict.bind(this);
    this.indexFrom = null;
    this.maxLen = null;
    this.wordIndex = null;
    this.vocabSize = null;
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      celeb: "",
      comments: []
    };
  }

  async loadModel() {
    this.model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
  }

  loadMetaData() {
    this.indexFrom = metadata['index_from'];
    this.maxLen = metadata['max_len'];
    this.wordIndex = metadata['word_index'];
    this.vocabSize = metadata['vocabulary_size'];
  }

  padSequences(sequences, maxLen, padding='pre', truncating='pre', value=0) {
    return sequences.map(seq => {
      if (seq.length > maxLen) {
        if (truncating === 'pre') {
          seq.splice(0, seq.length - maxLen);
        } else {
          seq.splice(maxLen, seq.length - maxLen);
        }
      }
      if (seq.length < maxLen) {
        const pad = [];
        for (let i = 0; i < maxLen - seq.length; i++) {
          pad.push(value);
        }
        if (padding === 'pre') {
          seq = pad.concat(seq);
        } else {
          seq = seq.concat(pad);
        }
      }
      return seq;
    });
  }

  predict(text) {
    const input = text.toLowerCase().replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').split(' ');
    const sequence = input.map(word => {
      let wordIndex = this.wordIndex[word] + this.indexFrom;
      if (wordIndex > this.vocabSize) {
        wordIndex = 2;
      }
      if (isNaN(wordIndex)) {
        return 2;
      }
      return wordIndex;
    });
    const paddedSequence = this.padSequences([sequence], this.maxLen);
    const tfInput = tf.tensor2d(paddedSequence, [1, this.maxLen]);
    const predictOut = this.model.predict(tfInput);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    const endMs = performance.now();
    return score;
  }

  celebRequest(person, channelId) {
    this.setState({scores: []});
    this.setState({celeb: person});
    fetch("https://newsapi.org/v2/everything?q=" + person + "&language=en&sources=buzzfeed, mashable, mtv-news, entertainment-weekly&apiKey=" + process.env.REACT_APP_NEWS_API)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          items: result
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    );
    fetch("https://www.googleapis.com/youtube/v3/commentThreads?key=" + process.env.REACT_APP_YOUTUBE_API + "&part=id,replies,snippet&maxResults=50&allThreadsRelatedToChannelId=" + channelId)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          comments: result
        });
      },
      (error) => {
      this.setState({
        isLoaded: true,
        error
        });
      }
    );
  }

  componentWillMount() {
    this.loadModel();
    this.loadMetaData();
  }

  render() {
    const {error, isLoaded, items, celeb, comments} = this.state;
    var titles = [];
    var scores = {};
    var recentComments = [];
    var commentScores = {};
    for (var i in items.articles) {
      titles.push([[items.articles[i].title, items.articles[i].url]]);
      var score;
      if (items.articles[i].content) {
        score = this.predict(items.articles[i].content);
      } else {
        score = this.predict(items.articles[i].title); //don't have content for whatever reason
      }
      scores[items.articles[i].title] = score;
    }
    var percentPositive = (Object.values(scores).filter(x => x > 0.65).length/titles.length).toFixed(2);
    var percentNegative = (1 - percentPositive).toFixed(2);
    var averageScore = Object.values(scores).reduce((a, b) => a + b, 0)/titles.length;
    for (var j in comments.items) {
      recentComments.push([comments.items[j].snippet.topLevelComment.snippet.textOriginal]);
      commentScores[comments.items[j].snippet.topLevelComment.snippet.textOriginal] = this.predict(comments.items[j].snippet.topLevelComment.snippet.textOriginal);
    }
    var commentPositive = (Object.values(commentScores).filter(x => x > 0.65).length/recentComments.length).toFixed(2);
    var commentNegative = (1 - commentPositive).toFixed(2);
    var averageComment = Object.values(commentScores).reduce((a, b) => a + b, 0)/recentComments.length;
    return (
      <div>
        <div> Celebrity Gossip App </div>
        <div> This app will display top celebrities and allow you to access written articles involving them, as well as the positivity/negativity percentages of recent articles published by them. TBD on how recent the info pulled will come from </div>
        <div> If the score next to each article is less than 0.65, then the article was mainly negative. If it is greater than 0.65, then the article is mainly positive. </div>
        <div> Influencers </div>
          <button onClick={() => { this.celebRequest("Charli D'Amelio", "UCi3OE-aN09WOcN9d2stCvPg")}}> Charli D'Amelio </button>
          <button onClick={() => { this.celebRequest("Addison Rae", "UCsjVdwXJydmlSLVT2zDuwpQ")}}> Addison Rae </button>
          <button onClick={() => { this.celebRequest("Dixie D'Amelio", "UCLOEGprmycLLbyzBj2jozLg")}}> Dixie D'Amelio </button>
          <button onClick={() => { this.celebRequest("James Charles", "UCucot-Zp428OwkyRm2I7v2Q")}}> James Charles </button>
          <button onClick={() => { this.celebRequest("Jeffree Star", "UCkvK_5omS-42Ovgah8KRKtg")}}> Jeffree Star </button>
          <button onClick={() => { this.celebRequest("Shane Dawson", "UCV9_KinVpV-snHe3C3n1hvA")}}> Shane Dawson </button>
          <button onClick={() => { this.celebRequest("Tana Mongeau", "UClWD8su9Sk6GzZDwy9zs3_w")}}> Tana Mongeau </button>
          <button onClick={() => { this.celebRequest("Gabbie Hanna", "UCfBpv6ahDMg7kEClQuMpzzw")}}> Gabbie Hanna </button>
          <button onClick={() => { this.celebRequest("Kim Kardashian", "UCeNhHgTE36tTQkJsjPaPwnA")}}> Kim Kardashian </button>
          <button onClick={() => { this.celebRequest("David Dobrik", "UCmh5gdwCx6lN7gEC20leNVA")}}> David Dobrik </button>
          <button onClick={() => { this.celebRequest("Kylie Jenner", "UCWkYXtnAuu7VTLPwUcRSB6A")}}> Kylie Jenner </button>
          <button onClick={() => { this.celebRequest("Kanye West", "UCs6eXM7s8Vl5WcECcRHc2qQ")}}> Kanye West </button>
          <button onClick={() => { this.celebRequest("Taylor Swift", "UCqECaJ8Gagnn7YCbPEzWH6g")}}> Taylor Swift </button>
          {/*
          <button onClick={() => { this.celebRequest("Barack Obama")}}> Barack Obama </button>
          <button onClick={() => { this.celebRequest("Donald Trump")}}> Donald Trump </button>
          */}
        <div> Results for {celeb}: {items.totalResults} articles </div>
        <ul>
          {titles.map((value, index) => {
          return <li key={index}> <a href={value[0][1]}> {value[0][0]} </a> {scores[value[0][0]]}</li>
          })}
        </ul>
        <div> Positive Percentage: {percentPositive} Negative Percentage: {percentNegative} </div>
        <div> Average Article Score: {averageScore}</div>
        <div> 50 Most Recent Youtube Comments </div>
        <ul>
          {recentComments.map((value, index) => {
          return <li key={index}> {value} Score: {commentScores[value]} </li>
          })}
        </ul>
        <div> Positive Percentage: {commentPositive} Negative Percentage: {commentNegative} </div>
        <div> Average Comment Score: {averageComment} </div>
      </div>
    );
  }
}

export default App;
