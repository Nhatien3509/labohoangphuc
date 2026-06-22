import ErrorToast, {
  type FlattenError,
} from "@common/components/containers/ErrorToast";

import ContentLoading from "@common/components/layout/loading/ContentLoading";
import ErrorBoundaryToast from "@common/components/layout/errors/ErrorBoundaryToast";
import ForbiddenError from "@common/components/layout/errors/Forbidden";
import LayoutLoading from "@common/components/layout/loading/LayoutLoading";
import NotFound from "@common/components/layout/errors/NotFound";
import NotFoundCleanup from "@common/components/layout/NotFoundCleanup";

import { type ApiError, type FetchResult } from "@/api/types";
import {
  type DefaultParams,
  type SearchParams,
  buildQueryParams,
} from "@common/lib/helpers/params";
import React, {
  type ComponentType,
  type ReactNode,
  Suspense,
  use,
} from "react";

export const withPage =
  <T, K extends DefaultParams>(
    fetchData: (query: K) => Promise<FetchResponse<T>>,
    defaultParams: K,
    isSearchParams = true,
    LoadingUI: ReactNode = <ContentLoading />,
  ) =>
  (
    PageContent: ComponentType<PageContentProps<T>>,
  ): ComponentType<{ searchParams: SearchParams; params: SearchParams }> =>
  ({ searchParams, params }) => {
    const querySearch = buildQueryParams(
      isSearchParams ? { ...params, ...searchParams } : params,
      defaultParams,
    );
    const fetchDataPromise = fetchData(querySearch);

    return (
      <Suspense fallback={LoadingUI}>
        <PageContentWithData
          dataPromise={fetchDataPromise}
          PageContent={PageContent}
          params={params}
          searchParams={searchParams}
        />
      </Suspense>
    );
  };

export const withLoading = <P extends object>(
  Component: ComponentType<P>,
  LoadingUI: ReactNode = <LayoutLoading />,
): ComponentType<P> => {
  const WrappedComponent: ComponentType<P> = (props: P) => (
    <Suspense fallback={LoadingUI}>
      <Component {...props} />
    </Suspense>
  );
  return WrappedComponent;
};

type PageContentProps<T> = {
  data: T;
  params: SearchParams;
  searchParams: SearchParams;
  errors?: {
    error: ApiError | FlattenError[];
    apiName: string;
    status: number;
    statusText?: string;
  }[];
};

type FetchResponse<T> =
  | FetchResult<T>
  | { name: string; response: FetchResult<unknown> }[];

export function handlePageError(res: {
  status: number;
  error?: ApiError | FlattenError[];
  statusText?: string;
}) {
  const { status, error, statusText } = res;

  switch (status) {
    case -1:
      return <ErrorBoundaryToast logSource="server-errors-page" />;
    case 403:
      return (
        <>
          <ForbiddenError />
          <NotFoundCleanup />
        </>
      );
    case 404:
      return <NotFound />;
    default:
      return (
        <>
          <ErrorToast
            data={error}
            statusCode={status}
            statusText={statusText}
          />
          <NotFoundCleanup />
        </>
      );
  }
}

function renderSingleResult<T>(
  result: FetchResult<T>,
  PageContent: ComponentType<PageContentProps<T>>,
  params: SearchParams,
  searchParams: SearchParams,
) {
  const { data, success } = result;

  if (!success) {
    return handlePageError(result);
  }

  return (
    <>
      <PageContent
        data={data as T}
        params={params}
        searchParams={searchParams}
      />
      <NotFoundCleanup />
    </>
  );
}

function renderMultipleResults<T>(
  responses: {
    name: string;
    response: FetchResult<unknown>;
    isMainAPI?: boolean;
  }[],
  PageContent: ComponentType<PageContentProps<T>>,
  params: SearchParams,
  searchParams: SearchParams,
) {
  const mainApiError = responses.find(
    ({ response, isMainAPI }) => isMainAPI && !response.success,
  );

  if (mainApiError) {
    return handlePageError(mainApiError.response);
  }

  const { data, errors } = responses.reduce<{
    data: Record<string, unknown>;
    errors: {
      error: ApiError | FlattenError[];
      apiName: string;
      status: number;
      statusText?: string;
    }[];
  }>(
    (acc, { name, response }) => {
      const { success, data, error, status, statusText } = response;
      if (!success) {
        acc.errors.push({
          error: error ?? [],
          apiName: name,
          status,
          statusText,
        });
      } else {
        acc.data[name] = data;
      }
      return acc;
    },
    { data: {}, errors: [] },
  );

  return (
    <>
      <PageContent
        data={data as T}
        params={params}
        searchParams={searchParams}
        errors={errors}
      />
      {errors.map(({ error, status, statusText, apiName }) => (
        <ErrorToast
          key={`${apiName}-${status}`}
          data={error}
          statusCode={status}
          statusText={statusText}
        />
      ))}
      <NotFoundCleanup />
    </>
  );
}

type PageContentWithDataProps<T> = {
  dataPromise: Promise<FetchResponse<T>>;
  PageContent: ComponentType<PageContentProps<T>>;
  params: SearchParams;
  searchParams: SearchParams;
};

function PageContentWithData<T>({
  dataPromise,
  PageContent,
  params,
  searchParams,
}: PageContentWithDataProps<T>) {
  const result = use(dataPromise);

  return Array.isArray(result)
    ? renderMultipleResults(result, PageContent, params, searchParams)
    : renderSingleResult(result, PageContent, params, searchParams);
}
