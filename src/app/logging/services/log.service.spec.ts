import { TestBed, inject } from '@angular/core/testing';

import { LogService } from './log.service';
import { LogLevel } from '../enums/log-level';



describe('LogService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogService]
    });
  });


  it('should be created', inject([LogService], (service: LogService) => {
    expect(service).toBeTruthy();
  }));

  it('should not display logging output when level is null', inject([LogService], (service: LogService) => {
    service.logLevel = null;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.error(text);
    service.warning(text);
    service.info(text);
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should not display logging output when level is undefined', inject([LogService], (service: LogService) => {
    service.logLevel = undefined;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.error(text);
    service.warning(text);
    service.info(text);
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should not display logging output when level is NONE', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.NONE;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.error(text);
    service.warning(text);
    service.info(text);
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should display errors correctly when level is ERROR', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.ERROR;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some error';
    service.error(text);
    expect(spy).toHaveBeenCalledWith(`%c${text}`, service.errorStyle);
  }));

  it('should not display debug, info, warning when level is ERROR', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.ERROR;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.warning(text);
    service.info(text);
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should display warnings correctly when level is WARNING', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.WARNING;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some warning';
    service.warning(text);
    expect(spy).toHaveBeenCalledWith(`%c${text}`, service.warningStyle);
  }));

  it('should display warnings and errors when level is WARNING', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.WARNING;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.warning(text);
    service.error(text);
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('should not display info and debug when level is WARNING', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.WARNING;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some error';
    service.debug(text);
    service.info(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should display info correctly when level is INFO', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.INFO;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some info';
    service.info(text);
    expect(spy).toHaveBeenCalledWith(`%c${text}`, service.infoStyle);
  }));

  it('should not display debug when level is INFO', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.INFO;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some info';
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(0);
  }));

  it('should display errors, warnings and info when level is INFO', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.INFO;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.error(text);
    service.warning(text);
    service.info(text);
    expect(spy).toHaveBeenCalledTimes(3);
  }));

  it('should display debug correctly when level is DEBUG', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.DEBUG;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some debug';
    service.debug(text);
    expect(spy).toHaveBeenCalledWith(`%c${text}`, service.debugStyle);
  }));

  it('should display errors, warnings, info and debug when level is DEBUG', inject([LogService], (service: LogService) => {
    service.logLevel = LogLevel.DEBUG;
    const spy = spyOn(console, 'log').and.callThrough();
    const text = 'some text';
    service.error(text);
    service.warning(text);
    service.info(text);
    service.debug(text);
    expect(spy).toHaveBeenCalledTimes(4);
  }));
});
