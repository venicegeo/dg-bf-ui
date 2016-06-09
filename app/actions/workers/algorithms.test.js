import expect, { spyOn, restoreSpies, createSpy } from 'expect'
import sinon from 'sinon'
import * as algorithms from './algorithms'
// import Client from '../../utils/piazza-client'

let _client, _handlers, _instance

//remove debug in console.
console.debug = function() {};

describe("James' first bf test", function() {
	it('should pass', function() {
		expect(true).toBeTruthy();
	});
});

describe('Algorithms', function() {

	describe('function start', function() {

		beforeEach(function() {
			_handlers = {
				beforeFetch: createSpy().andReturn(false),
				onFailure: createSpy().andReturn(false),
				onTerminate: createSpy().andReturn(false),
				onUpdate: createSpy().andReturn(false),
				shouldRun: createSpy().andReturn(false)
				};
			_client = {
				getServices: createSpy().andReturn(Promise.resolve(1))
			};
			// spyOn(_handlers, 'beforeFetch');
			// spyOn(_handlers, 'onFailure');
			// spyOn(_handlers, 'onTerminate');
			// spyOn(_handlers, 'onUpdate');
			// spyOn(_handlers, 'shouldRun');
			// spyOn(_client, 'getServices');
		});

		afterEach(function() {
			algorithms.terminate();
			restoreSpies();
		});

		it('runs work() function.', function() {
			algorithms.start(_client, 1, _handlers);
			expect(_handlers.shouldRun).toHaveBeenCalled();
		});

		it('only runs shouldRun() if ShouldRun() outputs false.', function() {
			algorithms.start(_client, 1, _handlers);
			// Calls
			expect(_handlers.shouldRun).toHaveBeenCalled();
			// Doesn't
			expect(_handlers.beforeFetch).toNotHaveBeenCalled();
			expect(_handlers.onFailure).toNotHaveBeenCalled();
			expect(_handlers.onTerminate).toNotHaveBeenCalled();
			expect(_handlers.onUpdate).toNotHaveBeenCalled();
			expect(_client.getServices).toNotHaveBeenCalled();
		});

		it('runs beforeFetch() if ShouldRun() outputs true.', function() {
			_handlers.shouldRun.andReturn(true);
			algorithms.start(_client, 1, _handlers);
			// Calls
			expect(_handlers.shouldRun).toHaveBeenCalled();
			expect(_handlers.beforeFetch).toHaveBeenCalled();
			// Doesn't
			expect(_handlers.onFailure).toNotHaveBeenCalled();
			expect(_handlers.onTerminate).toNotHaveBeenCalled();
			expect(_handlers.onUpdate).toNotHaveBeenCalled();
			expect(_client.getServices).toNotHaveBeenCalled();
		});
	});
});