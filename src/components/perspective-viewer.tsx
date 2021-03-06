/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import {useEffect, useRef} from "react";
import perspective, {Table} from "@finos/perspective";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import "./index.css";
import "@finos/perspective-viewer/dist/umd/material.css";
import {HTMLPerspectiveViewerElement, PerspectiveViewerOptions} from "@finos/perspective-viewer";
import { useGraphState } from './state';



const config: PerspectiveViewerOptions = {
};

export const PerspectiveViewer = (props: any): React.ReactElement => {
    const viewer = useRef<HTMLPerspectiveViewerElement>(null);
    const { table } = useGraphState();

    useEffect(() => {
    	    console.log(props);
	    console.log(table);
            if (viewer.current && table) {
                viewer.current.load(table as any);
                viewer.current.restore(config);
            }
    }, []);

    // You can also the use the stringified config values as attributes
    return <perspective-viewer ref={viewer} ></perspective-viewer>;
};
