// ------------------------------------------------------------------------------
//  Copyright (c) 2017 RobotlegsJS. All Rights Reserved.
//
//  NOTICE: You are permitted to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
// ------------------------------------------------------------------------------

import {
    IInjector,
    applyHooks,
    guardsApprove,
    instantiateUnmapped,
    ITypeFilter
} from "robotlegs";

import { IStateMediatorMapping } from "../api/IStateMediatorMapping";

import { StateMediatorManager } from "./StateMediatorManager";

/**
 * @private
 */
export class StateMediatorFactory {

    /*============================================================================*/
    /* Private Properties                                                         */
    /*============================================================================*/

    private _mediators: Map<any, any> = new Map<any, any>();

    private _injector: IInjector;

    private _manager: StateMediatorManager;

    /*============================================================================*/
    /* Constructor                                                                */
    /*============================================================================*/

    /**
     * @private
     */
    constructor(injector: IInjector, manager?: StateMediatorManager) {
        this._injector = injector;
        this._manager = manager || new StateMediatorManager(this);
    }

    /*============================================================================*/
    /* Public Functions                                                           */
    /*============================================================================*/

    /**
     * @private
     */
    public getMediator(item: any, mapping: IStateMediatorMapping): any {
        return this._mediators.get(item) ? this._mediators.get(item).get(<any>mapping) : null;
    }

    /**
     * @private
     */
    public createMediators(item: any, type: FunctionConstructor, mappings: any[]): any[] {
        let createdMediators: any[] = [];
        let mediator: any;
        for (let i in mappings) {
            let mapping: IStateMediatorMapping = mappings[i];
            mediator = this.getMediator(item, mapping);

            if (!mediator) {
                this.mapTypeForFilterBinding(mapping.matcher, type, item);
                mediator = this.createMediator(item, mapping);
                this.unmapTypeForFilterBinding(mapping.matcher, type, item)
            }

            if (mediator) {
                createdMediators.push(mediator);
            }
        }
        return createdMediators;
    }

    /**
     * @private
     */
    public removeMediators(item: any): void {
        let mediators: Map<any, IStateMediatorMapping> = this._mediators.get(item);
        if (!mediators) {
            return;
        }

        mediators.forEach((value, key) => this._manager.removeMediator(value, item, key));

        this._mediators.delete(item);
    }

    /**
     * @private
     */
    public removeAllMediators(): void {
        this._mediators.forEach((value, key) => this.removeMediators(key));
    }

    /*============================================================================*/
    /* Private Functions                                                          */
    /*============================================================================*/

    private createMediator(item: any, mapping: IStateMediatorMapping): any {
        let mediator: any = this.getMediator(item, mapping);

        if (mediator) {
            return mediator;
        }

        if (mapping.guards.length === 0 || guardsApprove(mapping.guards, this._injector)) {
            let mediatorClass: FunctionConstructor = mapping.mediatorClass;
            mediator = instantiateUnmapped(this._injector, mediatorClass);
            if (mapping.hooks.length > 0) {
                this._injector.bind(mediatorClass).toConstantValue(mediator);
                applyHooks(mapping.hooks, this._injector);
                this._injector.unbind(mediatorClass);
            }
            this.addMediator(mediator, item, mapping);
        }
        return mediator;
    }

    private addMediator(mediator: any, item: any, mapping: IStateMediatorMapping): void {
        let mediatorMap = this._mediators.get(item) || new Map<any, IStateMediatorMapping>();
        this._mediators.set(item, mediatorMap);
        mediatorMap.set(<any>mapping, mediator);
        this._manager.addMediator(mediator, item, mapping);
    }

    private mapTypeForFilterBinding(filter: ITypeFilter, type: FunctionConstructor, item: any): void {
        let requiredTypes = this.requiredTypesFor(filter, type);
        for (let i in requiredTypes) {
            let requiredType: FunctionConstructor = requiredTypes[i];
            this._injector.bind(requiredType).toConstantValue(item);
        }
    }

    private unmapTypeForFilterBinding(filter: ITypeFilter, type: FunctionConstructor, item: any): void {
        let requiredTypes = this.requiredTypesFor(filter, type);
        for (let i in requiredTypes) {
            let requiredType: FunctionConstructor = requiredTypes[i];
            if (this._injector.isBound(requiredType))
                this._injector.unbind(requiredType);
        }
    }

    private requiredTypesFor(filter: ITypeFilter, type: FunctionConstructor): FunctionConstructor[] {
        let requiredTypes: FunctionConstructor[] = filter.allOfTypes.concat(filter.anyOfTypes);

        if (requiredTypes.indexOf(type) === -1) {
            requiredTypes.push(type);
        }

        return requiredTypes;
    }
}