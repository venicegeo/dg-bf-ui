import expect, { spyOn, restoreSpies, createSpy } from 'expect'
import sinon from 'sinon'
import * as jobs from './jobs'

import {
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT
} from '../../constants'

// import Client from '../../utils/piazza-client'

let _client, _handlers, _instance, _ttl

//remove debug, error in console to clean up mocha test report.
// console.debug = function() {};
// console.error = function() {};


// describe("James' first bf test", function() {
// 	it('should pass', function() {
// 		expect(true).toBeTruthy();
// 	});
// });

describe('Jobs Worker', function() {

	beforeEach(function() {
		spyOn(console, 'debug');
		spyOn(console, 'error');
	})

	afterEach(function() {
		restoreSpies();
	})

	describe('start()', function() {

		describe('program flow', function() {
			var job_data = {
				records: [
					{
						status: ''
					}
				]
			};
			var job_status = {
				jobId: '',
				status: '',
				resultId: '',
				result: {
					dataId: ''
				}
			}

			beforeEach(function() {
				_handlers = {
					select: createSpy().andReturn(job_data),
					onFailure: createSpy().andReturn(false),
					onTerminate: createSpy().andReturn(false),
					onUpdate: createSpy().andReturn(false)
					};
				_client = {
					getFile: createSpy().andReturn(Promise.resolve(1)),
					getStatus: createSpy().andReturn(Promise.resolve(1))
				};
				_ttl = createSpy().andReturn(false);
			});

			afterEach(function() {
				jobs.terminate()
			});

			it('calls work() function.', function() {
				jobs.start(_client, 100, _ttl, _handlers);
				expect(_handlers.select).toHaveBeenCalled();
			});

			it('calls getStatus() if there is a running job.', function() {
				job_data.records[0].status = STATUS_RUNNING;
				_handlers.select.andReturn(job_data);
				jobs.start(_client, 100, _ttl, _handlers);
				// Calls
				expect(_client.getStatus).toHaveBeenCalled();
				// Doesn't
				expect(_handlers.onFailure).toNotHaveBeenCalled();
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
				expect(_handlers.onUpdate).toNotHaveBeenCalled();
				expect(_client.getFile).toNotHaveBeenCalled();
			});

			it('calls getFile() then onUpdate() if there is a running job with STATUS_SUCCESS.', function(done) {
				job_data.records[0].status = STATUS_RUNNING;
				job_status.status = STATUS_SUCCESS;
				_handlers.select.andReturn(job_data);
				_client.getStatus = function() {
					return new Promise(function(fulfill, reject) {
						fulfill(job_status);
					});
				};
				_handlers.onUpdate = function() {
					try {
						// Calls
						expect(_client.getFile).toHaveBeenCalled();
						// Doesn't
						expect(_handlers.onFailure).toNotHaveBeenCalled();
						expect(_handlers.onTerminate).toNotHaveBeenCalled();
						done();
					}
					catch(e) {
						done(e);
					};
				};
				jobs.start(_client, 100, _ttl, _handlers);
			});

			it('does not call onFailure() and onTerminate() if getStatus() throws an error.', function(done) {
				job_data.records[0].status = STATUS_RUNNING;
				job_status.status = STATUS_SUCCESS;
				_handlers.select.andReturn(job_data);
				_client.getStatus.andThrow();
				_handlers.onUpdate = function() {
					try {
						// Calls
						// Doesn't
						expect(_handlers.onFailure).toNotHaveBeenCalled();
						expect(_handlers.onTerminate).toNotHaveBeenCalled();
						done();
					}
					catch(e) {
						done(e);
					};
				};
				jobs.start(_client, 100, _ttl, _handlers);
			});
		});

		describe('errored program flow', function() {
			var job_data = {
				records: [
					{
						status: ''
					}
				]
			};

			it('calls onFailure() and onTerminate() if onUpdate() throws an error.', function(done) {
				var bad_handlers = {
					select: createSpy().andReturn(job_data),
					onFailure: createSpy().andReturn(false),
					onTerminate: function() {
						try {
							// Doesn't Call
							expect(bad_handlers.onFailure).toHaveBeenCalled();
							done();
						}
						catch(e) {
							done(e);
						}
					},
					onUpdate: createSpy().andThrow(new Error('Forced'))
				};
				var bad_client = {
					getFile: createSpy().andReturn(Promise.resolve(1)),
					getStatus: createSpy().andReturn(Promise.resolve(1))
				};
				var bad_ttl = createSpy().andReturn(false);
				job_data.records[0].status = STATUS_RUNNING;
				jobs.start(bad_client, 100, bad_ttl, bad_handlers);
			});
		});

		describe('functionality', function() {
			var job_data = {
				records: [
					{
						jobId: '',
						status: ''
					}
				]
			};
			var job_status = {
				jobId: '',
				status: '',
				resultId: '',
				result: {
					dataId: ''
				}
			};

			beforeEach(function() {
				_handlers = {
					select: function() {return job_data;},
					onFailure: function() {return false;},
					onTerminate: function() {return false;},
					onUpdate: function() {return false;}
					};
				_client = {
					getFile: function() {return Promise.resolve(1)},
					getStatus: function() {return Promise.resolve(1)}
				};
				_ttl = function() {return false;};
			});

			afterEach(function() {
				jobs.terminate()
			});

			it('only processes jobs with STATUS_RUNNING', function(done) {
				// Supply dummy data:
				job_data.records = [
					{id: 1, status: STATUS_RUNNING},
					{id: 2, status: STATUS_SUCCESS},
					{id: 3, status: STATUS_TIMED_OUT},
					{id: 5, status: STATUS_ERROR},
					{id: 8, status: 'Dummy!'},
					{id: 13, status: STATUS_RUNNING},
					{id: 21, status: STATUS_SUCCESS},
					{id: 34, status: STATUS_TIMED_OUT},
					{id: 55, status: STATUS_ERROR},
					{id: 11, status: 'Dummy!'},
					{id: 7, status: STATUS_RUNNING},
					{id: 314, status: STATUS_SUCCESS},
					{id: 17, status: STATUS_TIMED_OUT},
					{id: 999, status: STATUS_ERROR},
					{id: 42, status: 'Dummy!'},
				];
				var passing_values = [1, 13, 7];
				var current_index = 0;
				var custom_msg;
				_handlers.select = function() {return job_data;};
				// Check each job passed to getStatus, make sure that they are the ones expected.
				_client.getStatus = function(jobId) {
					try {
						custom_msg = 'Got job {actual}, expected job {expected}.';
						expect(jobId).toEqual(passing_values[current_index], custom_msg.replace('{actual}', jobId).replace('{expected}', passing_values[current_index]));
						current_index++
						return Promise.resolve(true);
					}
					catch(e) {
						done(e)
					};
				};
				// Make sure the right number of jobs were passed, before completing test.
				_handlers.onUpdate = function() {
					custom_msg = 'Processed {actual} jobs, expected {expected} jobs.';
					try {
						expect(current_index).toEqual(passing_values.length, custom_msg.replace('{actual}', current_index).replace('{expected}', passing_values.length));
						done();
					}
					catch(e) {
						done(e)
					};
				};
				jobs.start(_client, 100, _ttl, _handlers);
			});

			it('only runs fetchGeoJsonId() for jobs with STATUS_SUCCESS.', function(done) {
				// Supply dummy data:
				job_data.records = [
					{id: 0, status: STATUS_RUNNING},
					{id: 1, status: STATUS_RUNNING},
					{id: 2, status: STATUS_RUNNING},
					{id: 3, status: STATUS_RUNNING},
					{id: 4, status: STATUS_RUNNING},
					{id: 5, status: STATUS_RUNNING},
					{id: 6, status: STATUS_RUNNING},
					{id: 7, status: STATUS_RUNNING}
				];
				var job_status_array = [
					{jobId: 0, status: STATUS_SUCCESS, resultId: '', result: {dataId: 0} },
					{jobId: 1, status: STATUS_RUNNING, resultId: '', result: {dataId: 1} },
					{jobId: 2, status: 'Dummy!', resultId: '', result: {dataId: 2} },
					{jobId: 3, status: STATUS_RUNNING, resultId: '', result: {dataId: 3} },
					{jobId: 4, status: STATUS_TIMED_OUT, resultId: '', result: {dataId: 4} },
					{jobId: 5, status: STATUS_ERROR, resultId: '', result: {dataId: 5} },
					{jobId: 6, status: STATUS_SUCCESS, resultId: '', result: {dataId: 6} },
					{jobId: 7, status: STATUS_TIMED_OUT, resultId: '', result: {dataId: 7} }
				];
				var passing_values = [0, 6];
				var current_index = 0;
				var custom_msg
				_client.getStatus = function(jobId) {
					return Promise.resolve(job_status_array[jobId]);
				};
				_client.getFile = function(metadataId) {
					try {
						custom_msg = 'Got job {actual}, expected job {expected}.';
						expect(metadataId).toEqual(passing_values[current_index], custom_msg.replace('{actual}', metadataId).replace('{expected}', passing_values[current_index]));
						current_index++
						return Promise.resolve(true);
					}
					catch(e) {
						done(e)
					};
				};
				_handlers.onUpdate = function() {
					custom_msg = 'Processed {actual} jobs, expected {expected} jobs.';
					try {
						expect(current_index).toEqual(passing_values.length, custom_msg.replace('{actual}', current_index).replace('{expected}', passing_values.length));
						done();
					}
					catch(e) {
						done(e)
					};
				};
				jobs.start(_client, 100, _ttl, _handlers);
			});
		});
	});

	describe('terminate()', function() {
		var job_data = {
				records: [
					{
						status: ''
					}
				]
			};
		var job_status = {
				jobId: '',
				status: '',
				resultId: '',
				result: {
					dataId: ''
				}
			};

		describe('program flow', function() {

			it('calls onTerminate()', function() {
				_handlers = {
					select: createSpy().andReturn(job_data),
					onFailure: createSpy().andReturn(false),
					onTerminate: createSpy().andReturn(false),
					onUpdate: createSpy().andReturn(false)
					};
				_client = {
					getFile: createSpy().andReturn(Promise.resolve(1)),
					getStatus: createSpy().andReturn(Promise.resolve(1))
				};
				_ttl = createSpy().andReturn(false);

				jobs.start(_client, 100, _ttl, _handlers);
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
				jobs.terminate();
				expect(_handlers.onTerminate).toHaveBeenCalled();
			});

		});

		describe('functionality', function() {

			it('stops work() from recurring.', function(done) {
				// ToDo: verify this test works.
				var terminated = false
				_handlers = {
					select: function() {
						expect(terminated).toBe(false); // Every time work() executes, make sure terminate() has not run yet.
						return job_data;
					},
					onTerminate: function() {return false;}
					};
				jobs.start(_client, 100, _ttl, _handlers);
				jobs.terminate();
				terminated = true;
				setTimeout(done, 100); // Small delay to end, give work() a chance to run again.
			});

			it('nulls _instance, allowing start() to run again.', function() {
				_handlers = {
					select: function() {return job_data;},
					onTerminate: function() {return false;}
				};
				_client = {};
				jobs.start(_client, 100, _ttl, _handlers);
				expect(function() {
					jobs.start(_client, 100, _ttl, _handlers);
				}).toThrow('Attempted to start while already running');
				jobs.terminate();
				jobs.start(_client, 100, _ttl, _handlers);
				jobs.terminate();
			});

			it('nulls _handlers, preventing terminate() from running again.', function() {
				_handlers = {
					select: function() {return job_data;},
					onTerminate: function() {return false;}
					};
				_client = {};
				jobs.start(_client, 100, _ttl, _handlers);
				jobs.terminate();
				expect(function() {
					jobs.terminate();
				}).toThrow("Cannot read property 'onTerminate' of null");

			});

			it('nulls _client.', function() {
				_handlers = {
					select: function() {
						jobs.terminate();
						return job_data;
					},
					onTerminate: function() {return false;},
				};
				_client = {
					getStatus: function() {
						throw(new Error('_client should be nullified before it is called'));
					}};
				job_data.records[0].status = STATUS_RUNNING;
				expect(function() {
					jobs.start(_client, 100, _ttl, _handlers);
				}).toThrow("Cannot read property 'getStatus' of null");
			});
		});
	});
});