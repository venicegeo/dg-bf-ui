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
console.debug = function() {};
console.error = function() {};


// describe("James' first bf test", function() {
// 	it('should pass', function() {
// 		expect(true).toBeTruthy();
// 	});
// });

describe('Jobs Worker', function() {

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
				status: ''
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
				restoreSpies();
				try {
					jobs.terminate()
				}
				catch(e) {}
			});

			it('calls work() function.', function() {
				jobs.start(_client, 1, _ttl, _handlers);
				expect(_handlers.select).toHaveBeenCalled();
			});

			it('calls getStatus() if there is a running job.', function() {
				job_data.records[0].status = STATUS_RUNNING;
				_handlers.select.andReturn(job_data);
				jobs.start(_client, 1, _ttl, _handlers);
				// Calls
				expect(_client.getStatus).toHaveBeenCalled();
				// Doesn't
				expect(_handlers.onFailure).toNotHaveBeenCalled();
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
				expect(_handlers.onUpdate).toNotHaveBeenCalled();
				expect(_client.getFile).toNotHaveBeenCalled();
			});

			it('calls getFile() if there is a running job with STATUS_SUCCESS.', function(done) {
				job_data.records[0].status = STATUS_RUNNING;
				job_status.status = STATUS_SUCCESS;
				_handlers.select.andReturn(job_data);
				_client.getStatus = function() {
					return new Promise(function(fulfill, reject) {
						fulfill(job_status);
					})
						.then(function() {
							try {
								// Calls
								expect(_client.getFile).toHaveBeenCalled();
								// Doesn't
								expect(_handlers.onFailure).toNotHaveBeenCalled();
								expect(_handlers.onTerminate).toNotHaveBeenCalled();
								expect(_handlers.onUpdate).toNotHaveBeenCalled();
								done();	
							}
							catch(e) {
								done(e);
							};
						});
				};
				jobs.start(_client, 1, _ttl, _handlers);
			});

			it('calls onUpdate() if getServices() produces metadata array.', function(done) {
				_handlers.shouldRun.andReturn(true);
				_handlers.onUpdate = function() {done();};
				_client.getServices = function() {
					return new Promise(function(fulfill, reject) {
						fulfill([
							{
								resourceMetadata: {
									description: '',
									name: '',
									metadata: {
										Interface: ''
									}
								},
								serviceId: '',
								url: ''
							}
						]);
					});
				};
				jobs.start(_client, 1, _handlers);
			});

			it('calls onFailure() and onTerminate() if getServices() throws an error.', function(done) {
				_handlers.shouldRun.andReturn(true);
				_handlers.onTerminate = function() {
					try {
						// Calls
						expect(_handlers.onFailure).toHaveBeenCalled();
						// Doesn't
						expect(_handlers.onUpdate).toNotHaveBeenCalled();
						done();
					}
					catch(e) {
						done(e)
					};
				};
				_client.getServices.andThrow()
				jobs.start(_client, 1, _handlers);
			});
		});

		describe('functionality', function() {

		});
	});

	describe('terminate()', function() {

		describe('program flow', function() {

			beforeEach(function() {
				_handlers = {
					shouldRun: function() {return false;},
					onTerminate: createSpy().andReturn(false)
					};
				_client = {};

				jobs.start(_client, 1, _handlers);
			});

			it('calls onTerminate()', function() {
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
					shouldRun: function() {
						expect(terminated).toBe(false); // Every time work() executes, make sure terminate() has not run yet.
						return false;
					},
					onTerminate: function() {return false;}
					};
				jobs.start(_client, 1, _handlers);
				jobs.terminate();
				terminated = true;
				setTimeout(done, 100); // Small delay to end, give work() a chance to run again.
			});

			it('nulls _instance, allowing start() to run again.', function() {
				_handlers = {
					shouldRun: function() {return false;},
					onTerminate: function() {return false;}
					};
				_client = {};
				jobs.start(_client, 1, _handlers);
				expect(function() {
					jobs.start(_client, 1, _handlers);
				}).toThrow('Attempted to start while already running');
				jobs.terminate();
				jobs.start(_client, 1, _handlers);
				jobs.terminate();
			});

			it('nulls _handlers, preventing terminate() from running again.', function() {
				_handlers = {
					shouldRun: function() {return false;},
					onTerminate: function() {return false;}
					};
				_client = {};
				jobs.start(_client, 1, _handlers);
				jobs.terminate();
				expect(function() {
					jobs.terminate();
				}).toThrow("Cannot read property 'onTerminate' of null");

			});

			it('nulls _client.', function() {
				_handlers = {
					shouldRun: function() {return true;},
					onTerminate: function() {return false;},
					beforeFetch: function() {
						jobs.terminate();
						return false;
					}
				};
				_client = {
					getServices: function() {
						throw('_client should be nullified before it is called');
					}};
				expect(function() {
					jobs.start(_client, 1, _handlers);
				}).toThrow("Cannot read property 'getServices' of null");
			});
		});
	});
});