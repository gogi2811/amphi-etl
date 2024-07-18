
import { snowflakeIcon } from '../../../icons';
import { BaseCoreComponent } from '../../BaseCoreComponent';

export class SnowflakeInput extends BaseCoreComponent {
  constructor() {
    const defaultConfig = { dbOptions: { schema: "public", tableName: "" } };
    const form = {
      fields: [
        {
          type: "input",
          label: "Account",
          id: "dbOptions.account",
          placeholder: "Enter Account",
          connection: "Snowflake",
          advanced: true
        },
        {
          type: "input",
          label: "Database Name",
          id: "dbOptions.databaseName",
          connection: "Snowflake",
          placeholder: "Enter database name",
        },
        {
          type: "input",
          label: "Username",
          id: "dbOptions.username",
          placeholder: "Enter username",
          connection: "Snowflake",
          advanced: true
        },
        {
          type: "input",
          label: "Password",
          id: "dbOptions.password",
          placeholder: "Enter password",
          connection: "Snowflake",
          inputType: "password",
          advanced: true
        },
        {
          type: "input",
          label: "Warehouse",
          id: "dbOptions.warehouse",
          placeholder: "Enter warehouse name",
          advanced: true
        },
        {
          type: "input",
          label: "Schema",
          id: "dbOptions.schema",
          placeholder: "Enter schema name",
          advanced: true
        },
        {
          type: "input",
          label: "Table Name",
          id: "dbOptions.tableName",
          placeholder: "Enter table name",
        },
        {
          type: "codeTextarea",
          label: "SQL Query",
          height: '50px',
          mode: "sql",
          placeholder: 'SELECT * FROM table_name',
          id: "dbOptions.sqlQuery",
          tooltip: 'Optional. By default the SQL query is: SELECT * FROM table_name_provided. If specified, the SQL Query is used.',
          advanced: true
        }
      ],
    };

    super("Snowflake Input", "snowflakeInput", "pandas_df_input", [], "inputs.Databases", snowflakeIcon, defaultConfig, form);
  }

  public provideDependencies({ config }): string[] {
    let deps: string[] = [];
    deps.push('snowflake-sqlalchemy');
    return deps;
  }

  public provideImports({ config }): string[] {
    return ["import pandas as pd", "import sqlalchemy", "import urllib.parse", "from snowflake.sqlalchemy import URL"];
  }

  public generateComponentCode({ config, outputName }): string {
    const uniqueEngineName = `${outputName}_Engine`; // Unique engine name based on the outputName
    const tableReference = (config.dbOptions.schema && config.dbOptions.schema.toLowerCase() !== 'public')
      ? `${config.dbOptions.schema}.${config.dbOptions.tableName}`
      : config.dbOptions.tableName;

    const sqlQuery = config.dbOptions.sqlQuery && config.dbOptions.sqlQuery.trim()
      ? config.dbOptions.sqlQuery
      : `SELECT * FROM ${tableReference}`;

    const code = `
# Connect to the Snowflake database
${uniqueEngineName} = sqlalchemy.create_engine(URL(
    account = '${config.dbOptions.account}',
    user = '${config.dbOptions.username}',
    password = urllib.parse.quote("${config.dbOptions.password}"),
    database = '${config.dbOptions.database}',
    schema = '${config.dbOptions.schema}',
    warehouse = '${config.dbOptions.warehouse}'
))

# Execute SQL statement
try:
    with ${uniqueEngineName}.connect() as conn:
        ${outputName} = pd.read_sql(
            """${sqlQuery}""",
            con=conn.connection
        ).convert_dtypes()
finally:
    ${uniqueEngineName}.dispose()
`;
    return code;
  }

}
