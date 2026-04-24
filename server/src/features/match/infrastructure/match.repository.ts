import { MatchContract, MatchEntity } from "@skorify/domain/match";
import { BaseRepository, JsonDataSource } from "@skorify/shared";

/**
 * MatchRepository implementa MatchContract usando JSON como persistencia.
 * Hereda todas las operaciones CRUD de BaseRepository.
 */

//mejor pasar el data source como parametro con iraca
export class MatchRepository
  extends BaseRepository<MatchEntity>  
{
  constructor() {
    //Mirar como hacer la inyección de dependencias con iraca para no acoplar la ruta del archivo del repositorio
    //y permitir usar otro data source en el futuro sin modificar esta clase
    super(new JsonDataSource<MatchEntity>("matches.json"));
  }
}