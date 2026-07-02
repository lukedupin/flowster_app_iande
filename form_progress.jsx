import { CheckIcon } from '@heroicons/react/20/solid';
import * as Util from '../../src/helpers/util.js';

export const FormProgress = props => {
    const { steps } = props;
    const onStep = props.onStep || (() => {});

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex w-full items-center">
                {steps.map((step, stepIdx) => (
                    <li
                        key={step.name}
                        className={Util.classNames(
                            stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                            'relative'
                        )}
                    >
                        {step.status === 'complete' && (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-blue-600" />
                                </div>
                                <div onClick={() => onStep(step)}
                                    className="relative flex size-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-900"
                                >
                                    <CheckIcon aria-hidden="true" className="size-5 text-white" />
                                    <span className="sr-only">{step.name}</span>
                                </div>
                            </>
                        )}
                        {step.status === 'current' && (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div onClick={() => onStep(step)}
                                    className="relative flex size-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white"
                                >
                                    <span aria-hidden="true" className="size-2.5 rounded-full bg-blue-600" />
                                    <span className="sr-only">{step.name}</span>
                                </div>
                            </>
                        )}
                        {step.status !== 'complete' && step.status !== 'current' && (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div
                                    className="group relative flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"
                                    onClick={() => onStep(step)}
                                >
                                    <span aria-hidden="true" className="size-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                                    <span className="sr-only">{step.name}</span>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};