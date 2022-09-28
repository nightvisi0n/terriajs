import TimeIntervalCollectionProperty from "terriajs-cesium/Source/DataSources/TimeIntervalCollectionProperty";
import { isJsonObject } from "../../Core/Json";

/** Terria specific properties */
export interface TerriaFeatureData {
  type: "terriaFeatureData";

  /** If feature is time-based, this can be used instead of `Feature.properties` */
  timeIntervalCollection?: TimeIntervalCollectionProperty;

  /** For features generated by TableMixin (see createLongitudeLatitudeFeaturePerId/Row and createRegionMappedImageryProvider */
  rowIds?: number[];
}

export function isTerriaFeatureData(data: any): data is TerriaFeatureData {
  return (
    data &&
    isJsonObject(data, false) &&
    "type" in data &&
    data.type === "terriaFeatureData"
  );
}
