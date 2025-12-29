export declare const useSubmitActionProps: () => {
    type: string;
    onClick(): Promise<void>;
};
export declare const useEditFormProps: () => {
    form: import("@formily/core").Form<any>;
};
export declare const useDeleteActionProps: () => {
    confirm: {
        title: string;
        content: string;
    };
    onClick(): Promise<void>;
};
