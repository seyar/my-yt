import { test } from 'node:test'
import fs from 'fs'
import assert from 'assert';
import Repository from '../lib/repository.js'

let repo
test.beforeEach(() => {
  if (fs.existsSync('./test/data')) {
    fs.rmSync('./test/data', { recursive: true })
  }
  repo = new Repository('./test/data')
})
const video1 = {id: '12345', channelName: 'tester', title: 'The Code'}
const video2 = {id: '67890', channelName: 'programmer', title: 'The Error'}

test('empty repo provisions data folder', () => {
  assert.ok(repo)
  assert.equal(repo.paths.videos, './test/data/videos.json')
  assert.equal(repo.paths.channels, './test/data/channels.json')
  assert.equal(repo.getVideos().length, 0)
  assert.ok(fs.existsSync(repo.paths.videos))
  assert.ok(fs.existsSync(repo.paths.channels))
})

test('adds channel', () => {
  repo.addChannel('veritasium')
  assert.equal(repo.getChannels().length, 1)
  assert.equal(repo.channelExists('veritasium'), true)
})

test('gets channels', () => {
  repo.addChannel('veritasium')
  const channels = repo.getChannels()
  assert.equal(channels.length, 1)
  assert.equal(channels[0].name, 'veritasium')
})

test('upserts videos', () => {
  repo.upsertVideos([video1, video2])
  assert.equal(repo.getVideos().length, 2)
})

test('upserts single video', () => {
  repo.upsertVideos(video1)
  assert.equal(repo.getVideos().length, 1)
})

test('gets channel videos', () => {
  repo.upsertVideos([video1, video2])
  const videos = repo.getChannelVideos('tester')
  assert.equal(videos.length, 1)
  assert.equal(videos[0].title, 'The Code')
})

test('gets single video by id', () => {
  repo.upsertVideos([video1, video2])
  const video = repo.getVideo('12345')
  assert.equal(video.title, 'The Code')
})

test('deletes a video by id and sets downloaded true', () => {
  repo.upsertVideos([video1, video2])
  repo.deleteVideo('12345')
  assert.equal(repo.getVideos().length, 2)
  assert.deepEqual(repo.getVideo('12345'), {id: '12345', channelName: 'tester', title: 'The Code', downloaded: false})
})

test('toggles ignore video', () => {
  repo.upsertVideos([video1, video2])
  repo.toggleIgnoreVideo('12345')
  assert.equal(repo.getVideo('12345').ignored, true)
})

test('marks video as downloaded', () => {
  repo.upsertVideos([video1, video2])
  repo.setVideoDownloaded('12345')
  assert.equal(repo.getVideo('12345').downloaded, true)
})

test('sets video transcript', () => {
  repo.upsertVideos([video1, video2])
  repo.setVideoTranscript('12345', 'This is the transcript for The Code')
  assert.equal(repo.getVideo('12345').transcript, 'This is the transcript for The Code')
})

test('sets video summary', () => {
  repo.upsertVideos([video1, video2])
  repo.setVideoSummary('12345', 'This is the summary for The Code')
  assert.equal(repo.getVideo('12345').summary, 'This is the summary for The Code')
})

test('patches new video with addedAt', () => {
  const patchedVideo = repo.patchVideo(video1)
  assert.ok(patchedVideo.addedAt)
})

test('updates single video by id', () => {
  repo.upsertVideos(video1)
  const updatedVideo = repo.updateVideo(video1.id, { title: 'Updated Title' })
  assert.equal(updatedVideo.title, 'Updated Title')
})

test('gets video quality', () => {
  assert.equal(repo.getVideoQuality(), 720)
})
test('sets video quality', () => {
  assert.ok(repo.setVideoQuality(1080))
  assert.equal(repo.getVideoQuality(), 1080)
})