import expect, { spyOn, restoreSpies, createSpy } from 'expect'
import sinon from 'sinon'
import * as algorithms from './algorithms'
// import Client from '../../utils/piazza-client'

let _client, _handlers, _instance

// describe("James' first bf test", function() {
// 	it('should pass', function() {
// 		expect(true).toBeTruthy();
// 	});
// });

describe('Algorithms Worker', function() {

	beforeEach(function() {
		spyOn(console, 'debug');
		spyOn(console, 'error');
	})

	afterEach(function() {
		restoreSpies();
	})

	describe('start()', function() {

		describe('program flow', function() {

			beforeEach(function() {
				_handlers = {
					beforeFetch: createSpy().andReturn(false),
					onFailure: createSpy().andReturn(false),
					onTerminate: createSpy().andReturn(false),
					onUpdate: createSpy().andReturn(false),
					shouldRun: createSpy().andReturn(false)
					};
				_client = {
					getServices: createSpy().andReturn(Promise.resolve([
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
					]))
				};
			});

			afterEach(function() {
				algorithms.terminate()
				// try {
				// 	algorithms.terminate()
				// }
				// catch(e) {}
			});

			it('calls work() function.', function() {
				algorithms.start(_client, 50, _handlers);
				expect(_handlers.shouldRun).toHaveBeenCalled();
			});

			it('calls shouldRun() if shouldRun() outputs false.', function() {
				algorithms.start(_client, 50, _handlers);
				// Calls
				expect(_handlers.shouldRun).toHaveBeenCalled();
				// Doesn't
				expect(_handlers.beforeFetch).toNotHaveBeenCalled();
				expect(_handlers.onFailure).toNotHaveBeenCalled();
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
				expect(_handlers.onUpdate).toNotHaveBeenCalled();
				expect(_client.getServices).toNotHaveBeenCalled();
			});

			it('calls beforeFetch() and getServices() if shouldRun() outputs true.', function() {
				_handlers.shouldRun.andReturn(true);
				algorithms.start(_client, 50, _handlers);
				// Calls
				expect(_handlers.beforeFetch).toHaveBeenCalled();
				expect(_client.getServices).toHaveBeenCalled();
				// Doesn't
				expect(_handlers.onFailure).toNotHaveBeenCalled();
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
			});

			it('calls onUpdate() if getServices() produces metadata array.', function(done) {
				_handlers.shouldRun.andReturn(true);
				_handlers.onUpdate = function() {done();};
				algorithms.start(_client, 50, _handlers);
			});
		});

		describe('errored program flow', function() {
			it('calls onFailure() and onTerminate() if getServices() throws an error.', function(done) {
				var bad_handlers = {
					beforeFetch: createSpy().andReturn(false),
					onFailure: createSpy().andReturn(false),
					onUpdate: createSpy().andReturn(false),
					shouldRun: createSpy().andReturn(true),
					onTerminate: function() {
						try {
							// Calls
							expect(bad_handlers.onFailure).toHaveBeenCalled();
							// Doesn't
							expect(bad_handlers.onUpdate).toNotHaveBeenCalled();
							done();
						}
						catch(e) {
							done(e)
						}
					}
				};
				var bad_client = {
					getServices: createSpy().andReturn(Promise.reject(new Error('Forced')))
				};
				algorithms.start(bad_client, 50, bad_handlers);
			});			
		});

		describe('functionality', function() {
			var inputMeta
			var outputMeta

			afterEach(function() {
				algorithms.terminate()
			});

			it('reformats metadata properly', function(done) {
				inputMeta = {
					resourceMetadata: {
						description: 'The Phantom Menace',
						name: 'Attack of the Clones',
						metadata: {
							Interface: 'Revenge of the Sith'
						}
					},
					serviceId: 'A New Hope',
					url: 'The Empire Strikes Back',
					unused: 'Return of the Jedi'
				};
				outputMeta = {
					description: 'The Phantom Menace',
					id: 'A New Hope',
					name: 'Attack of the Clones',
					requirements: [],
					type: 'Revenge of the Sith',
					url: 'The Empire Strikes Back'
				};
				_handlers = {
					shouldRun: function() {return true;},
					beforeFetch: function() {return false;},
					onFailure: function() {return false;},
					onTerminate: function() {return false;},
					onUpdate: function(algor) {
						try {
							expect(algor).toEqual([outputMeta]);
							done();
						}
						catch(e) {
							done(e);
						}
					}
				};
				_client = {
					getServices: function() {
						return Promise.resolve([inputMeta])
					}
				};
				algorithms.start(_client, 50, _handlers);
			});

			it('handles multiple elements in the array', function(done) {
				var inputMeta = [
					{
						resourceMetadata: {
							description: 'The Phantom Menace',
							name: 'Attack of the Clones',
							metadata: {
								Interface: 'Revenge of the Sith'
							}
						},
						serviceId: 'A New Hope',
						url: 'The Empire Strikes Back',
						unused: 'Return of the Jedi'
					},
					{
						resourceMetadata: {
							description: 'An Unexpected Journey',
							name: 'The Desolation of Smaug',
							metadata: {
								Interface: 'The Battle of the Five Armies'
							}
						},
						serviceId: 'The Fellowship of the Ring',
						url: 'The Two Towers',
						unused: 'The Return of the King'
					},
					{
						resourceMetadata: {
							description: 'The Land Before Time',
							name: 'The Land Before Time 2',
							metadata: {
								Interface: 'The Land Before Time 3'
							}
						},
						serviceId: 'The Land Before Time 4',
						url: 'The Land Before Time 5',
						unused: 'The Land Before Time 6'
					}
				];
				var outputMeta = [
					{
						description: 'The Phantom Menace',
						id: 'A New Hope',
						name: 'Attack of the Clones',
						requirements: [],
						type: 'Revenge of the Sith',
						url: 'The Empire Strikes Back'
					},
					{
						description: 'An Unexpected Journey',
						id: 'The Fellowship of the Ring',
						name: 'The Desolation of Smaug',
						requirements: [],
						type: 'The Battle of the Five Armies',
						url: 'The Two Towers'
					},
					{
						description: 'The Land Before Time',
						id: 'The Land Before Time 4',
						name: 'The Land Before Time 2',
						requirements: [],
						type: 'The Land Before Time 3',
						url: 'The Land Before Time 5'
					}
				];
				var _handlers = {
					shouldRun: function() {return true;},
					beforeFetch: function() {return false;},
					onFailure: function() {return false;},
					onTerminate: function() {return false;},
					onUpdate: function(algor) {
						try {
							expect(algor).toEqual(outputMeta);
							done();
						}
						catch(e) {
							done(e);
						}
					}
				};
				var _client = {
					getServices: function() {
						return new Promise(function(fulfill, reject) {
							fulfill(inputMeta);
						});
					}
				};
				algorithms.start(_client, 50, _handlers);
			});

			it('normalizes requirements', function(done) {
				inputMeta = {
					resourceMetadata: {
						description: '',
						name: '',
						metadata: {
							Interface: '',
							[ 'ImgReq - Rey' ]: 'Daisy Ridley',
							[ 'ImgReq - Poe' ]: 'Oscar Isaac',
							[ 'ImgReq - FN2187' ]: 'John Boyega'
						}
					},
					serviceId: '',
					url: '',
					unused: ''
				};
				outputMeta = {
					description: '',
					id: '',
					name: '',
					requirements: [
						{
							description: 'Daisy Ridley',
							literal: 'Daisy Ridley',
							name: 'Rey'
						},
						{
							description: 'Oscar Isaac',
							literal: 'Oscar Isaac',
							name: 'Poe'
						},
						{
							description: 'John Boyega',
							literal: 'John Boyega',
							name: 'FN2187'
						}
					],
					type: '',
					url: ''
				};
				var _handlers = {
					shouldRun: function() {return true;},
					beforeFetch: function() {return false;},
					onFailure: function() {return false;},
					onTerminate: function() {return false;},
					onUpdate: function(algor) {
						try {
							expect(algor[0].requirements).toEqual(outputMeta.requirements);
							done();
						}
						catch(e) {
							done(e);
						}
					}
				};
				var _client = {
					getServices: function() {
						return new Promise(function(fulfill, reject) {
							fulfill([inputMeta]);
						});
					}
				};
				algorithms.start(_client, 50, _handlers);
			});

			it.skip('normalizes "cloudCover" requirement', function() {
				// pending refactor
			});

			it.skip('normalizes "bands" requirement', function() {
				// pending refactor
			});

			it('passes the pattern "^BF_Algo" to getServices()', function(done) {
				_handlers = {
					shouldRun: function() {return true;},
					onTerminate: function() {return false;},
					beforeFetch: function() {return false;}
					};
				_client = {
					getServices: function(input) {
						expect(input.pattern).toEqual('^BF_Algo');
						done();
					}
				};
				algorithms.start(_client, 50, _handlers);
			});
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

				algorithms.start(_client, 50, _handlers);
			});

			it('calls onTerminate()', function() {
				expect(_handlers.onTerminate).toNotHaveBeenCalled();
				algorithms.terminate();
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
				algorithms.start(_client, 50, _handlers);
				algorithms.terminate();
				terminated = true;
				setTimeout(done, 100); // Small delay to end, give work() a chance to run again.
			});

			it('nulls _instance, allowing start() to run again.', function() {
				_handlers = {
					shouldRun: function() {return false;},
					onTerminate: function() {return false;}
					};
				_client = {};
				algorithms.start(_client, 50, _handlers);
				expect(function() {
					algorithms.start(_client, 50, _handlers);
				}).toThrow('Attempted to start while already running');
				algorithms.terminate();
				algorithms.start(_client, 50, _handlers);
				algorithms.terminate();
			});

			it('nulls _handlers, preventing terminate() from running again.', function() {
				_handlers = {
					shouldRun: function() {return false;},
					onTerminate: function() {return false;}
					};
				_client = {};
				algorithms.start(_client, 50, _handlers);
				algorithms.terminate();
				expect(function() {
					algorithms.terminate();
				}).toThrow("Cannot read property 'onTerminate' of null");

			});

			it('nulls _client.', function() {
				_handlers = {
					shouldRun: function() {return true;},
					onTerminate: function() {return false;},
					beforeFetch: function() {
						algorithms.terminate();
						return false;
					}
				};
				_client = {
					getServices: function() {
						throw(new Error('_client should be nullified before it is called'));
					}};
				expect(function() {
					algorithms.start(_client, 50, _handlers);
				}).toThrow("Cannot read property 'getServices' of null");
			});
		});
	});
});