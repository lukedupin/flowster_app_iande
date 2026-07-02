import React, {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle
} from 'react'
import * as Util from "../../src/helpers/util.js";
import 'github-markdown-css/github-markdown-light.css';
import {CheckCircleIcon, PlusCircleIcon} from "@heroicons/react/24/outline/index";
import {ButtonX} from "../../src/components/button_x.jsx";


// Forward declare the handle send function
export const FormUI = forwardRef((props, ref) => {
    const {title, is_array, fields, showToast} = props
    const [content, setContent] = useState({})

    const indices = props.indices || []
    const className = props.className || ""
    const onContentChange = props.onContentChange || (() => {})
    const onNext = props.onNext || (() => {})
    const onAddAnother = props.onAddAnother || (() => {})
    const onIndicesClick = props.onIndicesClick || (() => {})
    const onIndicesRemove = props.onIndicesRemove || (() => {})

    useImperativeHandle(ref, () => ({
        updateContent(updates, merge = true) {
            setContent(prev => {
                const nc = merge? { ...prev }: {}
                for (const key in updates) {
                    if ( updates[key] ) {
                        nc[key] = updates[key]
                    }
                }
                return nc
            })
        },
    }), [content])

    const calcColSpan = (info) => {
        if ( info.col_end !== undefined && info.col_end > 0 ) {
            return `col-start-${info.col_span} col-end-${parseInt(info.col_end) + parseInt(info.col_span)}`
        }

        return `col-span-${info.col_span}`
    }

    const handleInputChange = (key, value) => {
        setContent(prev => ({ ...prev, [key]: value }));
    }

    const allow_next = fields.every( f => content[f.name] && content[f.name].length > 0 ) && fields.length > 0
    const ary = [1,2,3,4,5,,7,8,,9,8,8]
    
    return (
        <div className={className}>
            <h2 className="text-2xl font-bold mb-4 ml-2">{title}</h2>
            {indices.length > 0 &&
            <div className="pl-8 flex flex-row flex-wrap gap-4 w-fit">
                {indices.map( (obj, idx) => (
                <ButtonX
                    key={`indices_${idx}`}
                    text={obj.text}
                    onClick={() => onIndicesClick(idx, obj)}
                    onRemove={() => onIndicesRemove(idx, obj)}
                    />
                ))}
            </div>
            }

            <div className="grid grid-cols-6 gap-x-6 p-4">
                {fields.map( (field, idx) => (
                    <div key={`field_${idx}`} className={Util.classNames( calcColSpan(field), "mb-4")}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.title}</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={content[field.name] || ''}
                                onChange={e => handleInputChange(field.name, e.target.value)}
                                onBlur={e => onContentChange(content)}
                            />
                    </div>
                ))}
            </div>

            {allow_next &&
                <div className={Util.classNames("w-full inline-flex px-6 pb-4", is_array? "justify-between": "justify-end")}>
                    {is_array &&
                    <button
                        type="button"
                        onClick={onAddAnother}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Add Another
                        <PlusCircleIcon aria-hidden="true" className="-mr-0.5 size-5" />
                    </button>
                    }
                    <button
                        type="button"
                        onClick={onNext}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Next
                        <CheckCircleIcon aria-hidden="true" className="-mr-0.5 size-5" />
                    </button>
                </div>
            }
        </div>
    )
})