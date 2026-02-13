package app.common.mapper;

import java.util.List;

public interface EntityResMapper<E,D> {


    D toDTO(E entity);


    List<D> toDTOList(List<E> entities);
}

