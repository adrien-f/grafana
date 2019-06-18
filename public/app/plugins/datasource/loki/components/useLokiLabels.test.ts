import { renderHook, act } from 'react-hooks-testing-library';
import LanguageProvider from 'app/plugins/datasource/loki/language_provider';
import { useLokiLabels } from './useLokiLabels';
import { DataSourceStatus } from '@grafana/ui/src/types/datasource';
import { TimeRange, DefaultTimeZone } from '@grafana/ui';

describe('useLokiLabels hook', () => {
  it('should refresh labels', async () => {
    const datasource = {
      metadataRequest: () => ({ data: { data: [] as any[] } }),
    };
    const languageProvider = new LanguageProvider(datasource);
    const logLabelOptionsMock = ['Holy mock!'];
    const rangeMock = {
      from: {
        valueOf: () => 1560153109000,
      },

      to: {
        valueOf: () => 1560163909000,
      },

      raw: {
        from: '1560153109000',
        to: '1560163909000',
      },
    };

    languageProvider.refreshLogLabels = () => {
      languageProvider.logLabelOptions = logLabelOptionsMock;
      return Promise.resolve();
    };

    const { result, waitForNextUpdate } = renderHook(() =>
      useLokiLabels(
        languageProvider,
        true,
        [],
        rangeMock as TimeRange,
        DefaultTimeZone,
        DataSourceStatus.Connected,
        DataSourceStatus.Connected
      )
    );
    act(() => result.current.refreshLabels());
    expect(result.current.logLabelOptions).toEqual([]);
    await waitForNextUpdate();
    expect(result.current.logLabelOptions).toEqual(logLabelOptionsMock);
  });

  it('should force refresh labels after a disconnect', () => {
    const datasource = {
      metadataRequest: () => ({ data: { data: [] as any[] } }),
    };

    const rangeMock = {
      from: {
        valueOf: () => 1560153109000,
      },

      to: {
        valueOf: () => 1560163909000,
      },

      raw: {
        from: '1560153109000',
        to: '1560163909000',
      },
    };

    const languageProvider = new LanguageProvider(datasource);
    languageProvider.refreshLogLabels = jest.fn();

    renderHook(() =>
      useLokiLabels(
        languageProvider,
        true,
        [],
        rangeMock as TimeRange,
        DefaultTimeZone,
        DataSourceStatus.Connected,
        DataSourceStatus.Disconnected
      )
    );

    expect(languageProvider.refreshLogLabels).toBeCalledTimes(1);
    expect(languageProvider.refreshLogLabels).toBeCalledWith(DefaultTimeZone, rangeMock, true);
  });

  it('should not force refresh labels after a connect', () => {
    const datasource = {
      metadataRequest: () => ({ data: { data: [] as any[] } }),
    };

    const rangeMock = {
      from: {
        valueOf: () => 1560153109000,
      },

      to: {
        valueOf: () => 1560163909000,
      },

      raw: {
        from: '1560153109000',
        to: '1560163909000',
      },
    };

    const languageProvider = new LanguageProvider(datasource);
    languageProvider.refreshLogLabels = jest.fn();

    renderHook(() =>
      useLokiLabels(
        languageProvider,
        true,
        [],
        rangeMock as TimeRange,
        DefaultTimeZone,
        DataSourceStatus.Disconnected,
        DataSourceStatus.Connected
      )
    );

    expect(languageProvider.refreshLogLabels).not.toBeCalled();
  });
});
