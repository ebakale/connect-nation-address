// Type declarations for leaflet-routing-machine
import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      router?: IRouter;
      lineOptions?: LineOptions;
      show?: boolean;
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      fitSelectedRoutes?: boolean;
      showAlternatives?: boolean;
    }

    interface LineOptions {
      styles?: L.PathOptions[];
      extendToWaypoints?: boolean;
      missingRouteTolerance?: number;
    }

    interface IRouter {
      route(waypoints: L.LatLng[], callback: (err?: Error, routes?: IRoute[]) => void): void;
    }

    interface IRoute {
      name: string;
      coordinates: L.LatLng[];
      summary: IRouteSummary;
      instructions: IInstruction[];
      inputWaypoints: L.LatLng[];
      waypoints: L.LatLng[];
    }

    interface IRouteSummary {
      totalDistance: number;
      totalTime: number;
    }

    interface IInstruction {
      text: string;
      distance: number;
      time: number;
      type: string;
      road?: string;
      direction?: string;
      index: number;
    }

    interface RoutingResultEvent {
      routes: IRoute[];
    }

    interface Control extends L.Control {
      on(type: 'routesfound', fn: (e: RoutingResultEvent) => void): this;
      on(type: 'routingerror', fn: (e: Error) => void): this;
      addTo(map: L.Map): this;
    }

    function control(options: RoutingControlOptions): Control;
    function osrmv1(options?: { serviceUrl?: string }): IRouter;
  }
}
