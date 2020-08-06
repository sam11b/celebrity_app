import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import metadata from './data/metadata.json';
import { combineLocations } from '@tensorflow/tfjs-core/dist/ops/axis_util';

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
    this.profilePics = ["https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/101563288_2966744403557800_8495800011362140160_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=uaVI9SSYKdcAX-Ujn--&oh=5b17e64b95462f4bb65946f14325ad45&oe=5F55089D", 
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/115887681_846447039216173_6691181409458713672_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=rhcYGAvWUKcAX9Ot0-X&oh=6c4b49d23c55a3404b3718d6b0d32eef&oe=5F534128", 
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/113138581_615696462694354_1608166533357118244_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=8XCdvAWd5GIAX__9ZTM&oh=0b36693735aa9faa99483530bf9d6c80&oe=5F54D3F1",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/91918064_2841939835913061_4859397024568573952_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=V3iumYpxNPEAX_NkBt7&oh=a66aaccabab07c765fce8cfc36306c2a&oe=5F54E0F7",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/116802941_915850515595728_3790549794380087079_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=EfWWokkSchQAX-DWWER&oh=29ac92c20875599143e604f34d50126d&oe=5F56F135",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/107514676_207259310599048_924206244135746897_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=ucbzmiOJ2VwAX_Rdsaq&oh=8bfdb3e361b814c9454b36d06d466689&oe=5F54CBB3",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/94203357_156480879120989_6182918508528009216_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=sW3Dwc0GF2QAX-OLAQf&oh=ee802dd5aa167c5466bbbb457a956917&oe=5F5567D9",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/46347929_350571769088297_8878592158483873792_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=r6fwNUC0_F4AX8rU8nD&oh=42fadde8cd09155f690ae66e8305bc77&oe=5F5727AB",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/109136688_610125179899980_1868015297406610141_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=YdLUhCNjA3oAX-zZhKa&oh=7bcbb73f56fbdc8556979b88ce0d6986&oe=5F560D22",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/83644818_623008265179998_2878620955909816320_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=gf4UR4IIO-sAX9r-fHt&oh=455e0499101489b1d0bb87bb8a4f1f79&oe=5F54EB6D",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/97583101_532444297451866_4924448281406210048_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=VWygzb9VZIwAX_kjLmO&oh=c6a5896d95be1cbce8f9abebde06fb6a&oe=5F568B98",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/107096538_276681710071303_4918856211597712267_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=-xAO3DKXYlMAX-o0Q8K&oh=8fd14b086af1ab36502fa1f3fc48b7df&oe=5F542FF9",
    "https://scontent-lax3-2.cdninstagram.com/v/t51.2885-19/s150x150/110606554_274256377193351_7760278100826446941_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com&_nc_ohc=tpurtNlAZ50AX80qbWE&oh=3e66fa5a3f265c01fd482d8278764666&oe=5F548B56"
  ];
    this.instaIds = [];
    this.getProfilePics = this.getProfilePics.bind(this);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      celeb: "",
      comments: [],
      recentPics: [],
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

  celebRequest(person, channelId, instaId) {
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

    fetch('https://instagram.com/graphql/query/?query_id=17888483320059182&variables={"id":"'+ instaId +'","first":20,"after":null}')
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          recentPics: result
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

  async getProfilePics() {
    var celebs = ['charlidamelio', 'addisonraee', 'dixiedamelio', 'jamescharles', 'jeffreestar', 'shanedawson', 'tanamongeau', 'soowhatifimthemonster', 'kimkardashian', 'daviddobrik', 'kyliejenner', 'jesusisking', 'taylorswift'];
    for (var i in celebs) {
      await fetch('https://www.instagram.com/web/search/topsearch/?query=' + celebs[i])
      .then(res => res.json())
      .then(
        (result) => {
          this.instaIds.push(result.users[0].user.pk);
        }
      )
    }
    console.log(this.profilePics);

  }

  componentWillMount() {
    this.loadModel();
    this.loadMetaData();
    this.getProfilePics();
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
    var insta_sources = [];
    if (this.state.recentPics.length != 0)
      for (var i in this.state.recentPics.data.user.edge_owner_to_timeline_media.edges)
        insta_sources.push(this.state.recentPics.data.user.edge_owner_to_timeline_media.edges[i].node.display_url);
    return (
      <div>
        <div> Celebrity Gossip App </div>
        <div> This app will display top celebrities and allow you to access written articles involving them, as well as the positivity/negativity percentages of recent articles published by them. TBD on how recent the info pulled will come from </div>
        <div> If the score next to each article is less than 0.65, then the article was mainly negative. If it is greater than 0.65, then the article is mainly positive. </div>
        <div> Influencers </div>
          <button onClick={() => { this.celebRequest("Charli D'Amelio", "UCi3OE-aN09WOcN9d2stCvPg", this.instaIds[0])}}> <img src={this.profilePics[0]} style={{width: 100, height: 100}}/> Charli D'Amelio </button>
          <button onClick={() => { this.celebRequest("Addison Rae", "UCsjVdwXJydmlSLVT2zDuwpQ", this.instaIds[1])}}> <img src={this.profilePics[1]} style={{width: 100, height: 100}}/> Addison Rae </button>
          <button onClick={() => { this.celebRequest("Dixie D'Amelio", "UCLOEGprmycLLbyzBj2jozLg", this.instaIds[2])}}> <img src={this.profilePics[2]} style={{width: 100, height: 100}}/> Dixie D'Amelio </button>
          <button onClick={() => { this.celebRequest("James Charles", "UCucot-Zp428OwkyRm2I7v2Q", this.instaIds[3])}}> <img src={this.profilePics[3]} style={{width: 100, height: 100}}/> James Charles </button>
          <button onClick={() => { this.celebRequest("Jeffree Star", "UCkvK_5omS-42Ovgah8KRKtg", this.instaIds[4])}}>  <img src={this.profilePics[4]} style={{width: 100, height: 100}}/> Jeffree Star </button>
          <button onClick={() => { this.celebRequest("Shane Dawson", "UCV9_KinVpV-snHe3C3n1hvA", this.instaIds[5])}}> <img src={this.profilePics[5]} style={{width: 100, height: 100}}/> Shane Dawson </button>
          <button onClick={() => { this.celebRequest("Tana Mongeau", "UClWD8su9Sk6GzZDwy9zs3_w", this.instaIds[6])}}> <img src={this.profilePics[6]} style={{width: 100, height: 100}}/> Tana Mongeau </button>
          <button onClick={() => { this.celebRequest("Gabbie Hanna", "UCfBpv6ahDMg7kEClQuMpzzw", this.instaIds[7])}}> <img src={this.profilePics[7]} style={{width: 100, height: 100}}/> Gabbie Hanna </button>
          <button onClick={() => { this.celebRequest("Kim Kardashian", "UCeNhHgTE36tTQkJsjPaPwnA", this.instaIds[8])}}> <img src={this.profilePics[8]} style={{width: 100, height: 100}}/> Kim Kardashian </button>
          <button onClick={() => { this.celebRequest("David Dobrik", "UCmh5gdwCx6lN7gEC20leNVA", this.instaIds[9])}}> <img src={this.profilePics[9]} style={{width: 100, height: 100}}/> David Dobrik </button>
          <button onClick={() => { this.celebRequest("Kylie Jenner", "UCWkYXtnAuu7VTLPwUcRSB6A", this.instaIds[10])}}> <img src={this.profilePics[10]} style={{width: 100, height: 100}}/> Kylie Jenner </button>
          <button onClick={() => { this.celebRequest("Kanye West", "UCs6eXM7s8Vl5WcECcRHc2qQ", this.instaIds[11])}}> <img src={this.profilePics[11]} style={{width: 100, height: 100}}/> Kanye West </button>
          <button onClick={() => { this.celebRequest("Taylor Swift", "UCqECaJ8Gagnn7YCbPEzWH6g", this.instaIds[12])}}> <img src={this.profilePics[12]} style={{width: 100, height: 100}}/> Taylor Swift </button>
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
        <div> Recent Photos </div>
        {insta_sources.map((value, index) => {
          return <img src={value} key={index} style={{width: 300, height: 300}} />
        })}
      </div>
    );
  }
}

export default App;
