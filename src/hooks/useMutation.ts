import { useCallback } from "react";

import {
  useMutation as useReactQueryMutation,
  UseMutationOptions,
  MutateOptions,
} from "react-query";

import { ApiMethods } from "@app/constants/api.constants";
import useApi from "@app/hooks/useApi";
import { Response, ApiError } from "@app/types/api.types";

type Options<ResponseData = unknown, RequestData = void> = Omit<
  UseMutationOptions<Response<ResponseData>, ApiError, RequestData>,
  "mutationKey"
>;

type TParams = { [key: string]: string | number };

const PARAMS_KEY = Symbol("params");

type RequestDataWithParams<
  RequestData = void,
  Params = TParams
> = RequestData & {
  [PARAMS_KEY]?: Params;
};

export default function useMutation<
  ResponseData = unknown,
  RequestData = void,
  Params = TParams
>(
  url: string,
  method:
    | ApiMethods.GET
    | ApiMethods.POST
    | ApiMethods.PUT
    | ApiMethods.DELETE = ApiMethods.POST,
  options?: Options<ResponseData, RequestData>
) {
  const api = useApi();
  const mutation = useReactQueryMutation<
    Response<ResponseData>,
    unknown,
    RequestDataWithParams<RequestData, Params>
  >(async data => {
    // A little trick to use mutation dynamically, for example url is /users/:id
    // Note: Waiting this discussion https://github.com/tannerlinsley/react-query/discussions/1226
    let parsedUrl = url;
    if (typeof data === "object" && typeof data[PARAMS_KEY] === "object") {
      Object.keys(data[PARAMS_KEY] as unknown as TParams).forEach(paramStr => {
        const param = paramStr as keyof Params;

        parsedUrl = parsedUrl.replace(
          new RegExp(`:${param as string}`, "g"),
          data[PARAMS_KEY]?.[param] as unknown as string
        );
      });
    }

    // Delete temporary params before sending to API
    const requestData: RequestData = data;
    delete data[PARAMS_KEY];

    return api[method.toLowerCase() as "post" | "put" | "delete" | "get"](
      parsedUrl,
      requestData
    );
  }, options);

  const { mutateAsync: mutateAsyncReactQuery } = mutation;

  const mutateAsync = useCallback(
    async (
      data: RequestData,
      params?: Params,
      mutateOptions?: MutateOptions<
        Response<ResponseData>,
        ApiError,
        RequestDataWithParams<RequestData, Params>
      >
    ): Promise<Response<ResponseData>> => {
      return mutateAsyncReactQuery(
        {
          ...data,
          [PARAMS_KEY]: params,
        },
        mutateOptions
      );
    },
    [mutateAsyncReactQuery]
  );

  return {
    ...mutation,
    mutateAsync,
  };
}
