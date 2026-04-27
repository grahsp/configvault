using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixMissingActorId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LastModifiedBy",
                table: "config_values",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "LastModifiedBy",
                table: "config_values",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
