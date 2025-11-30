package com.smarttransit.routeservice.dto;

public record CoordOnly(ListWrapper from, ListWrapper to) {
    public static record ListWrapper(java.util.List<Double> coordinates) {}
}
