import test from 'ava';
import { handler as Skill } from '../build/skill';
import Request from 'alexa-request';
import chai from 'chai';
import chaiSubset from 'chai-subset';

const expect = chai.expect;
chai.use(chaiSubset);

test('LaunchRequest', async () => {
  const event = Request.launchRequest().build();

  const response = await Skill(event);
  expect(response.response.outputSpeech.text).to.contain('Willkommen');
  expect(response).to.containSubset({
    response: {
      shouldEndSession: false,
      outputSpeech: { type: 'PlainText' }
    }
  });
});

test('AMAZON.StopIntent', async () => {
  const event = Request.intent('AMAZON.StopIntent').build();

  const response = await Skill(event);
  expect(response).to.containSubset({
    response: {
      shouldEndSession: true,
      outputSpeech: { type: 'PlainText', text: 'Bis bald!' }
    }
  });
});

test('AMAZON.CancelIntent', async () => {
  const event = Request.intent('AMAZON.CancelIntent').build();

  const response = await Skill(event);
  expect(response).to.containSubset({
    response: {
      shouldEndSession: true,
      outputSpeech: { type: 'PlainText', text: 'Bis bald!' }
    }
  });
});

test('Continent answer', async () => {
  const event = Request.intent('ContinentIntent', { continent: 'europa' }).session({
    attributes: {
      iso: 'DEU',
      type: 'continent'
    }
  }).build();

  const response = await Skill(event);
  expect(response.response.outputSpeech.text).to.contain('Das war richtig!');
});

test('Neighbour answer', async () => {
  const event = Request.intent('CountryIntent', { country: 'belgien' }).session({
    attributes: {
      iso: 'DEU',
      type: 'neighbour'
    }
  }).build();

  const response = await Skill(event);
  expect(response.response.outputSpeech.text).to.contain('Das war richtig!');
});

test('Capital answer', async () => {
  const event = Request.intent('CountryIntent', { country: 'deutschland' }).session({
    attributes: {
      iso: 'DEU',
      type: 'capital'
    }
  }).build();

  const response = await Skill(event);
  expect(response.response.outputSpeech.text).to.contain('Das war richtig!');
});

test('SessionEndedRequest', async () => {
  const event = Request.sessionEndedRequest().build();
  const response = await Skill(event);
  expect(response).to.deep.equal({});
});
