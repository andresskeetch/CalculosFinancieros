var app = angular.module("CalculosFinancieros", ['ngResource', 'ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when("/", {
                controller: 'mainController',
                templateUrl: "view/home/home.html"
            })
            .when('/:modulo/:url', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'mainController'
            })
            .otherwise("/");
    }
]);


app.controller("appController", function($scope){
})
app.controller("mainController",['$scope','$routeParams', function($scope,$routeParams){
    if ($routeParams.url == undefined) {
   
    }
    else {
        console.log($routeParams);
        $scope.templateUrl = 'view/' + $routeParams.modulo + '/' + $routeParams.url + '.html';
    }
}])

app.controller("pagosController", function($scope){
    $scope.data=[];
    $scope.respuesta=[];
    $scope.respuesta.banderaError=false;
    $scope.respuesta.mensajeError="";
    $scope.respuesta.banderaSuccess=false;
    $scope.respuesta.mensajeSuccess="";
    $scope.variablesUso=[];
    $scope.variablesUso.pagosExtraordinarios=[];
    $scope.data.tipoFuturo='EFECTIVO';
    $scope.tempData={};
    $scope.agregarPago=function(){
        $scope.variablesUso.pagosExtraordinarios.push({
            periodo:0,
            valor:0,
            tipo:''
        })
    }
    $scope.Nueva=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.variablesUso=[];
        $scope.data=[];
        $scope.data.tipoFuturo='EFECTIVO';
    }
    $scope.Calcular=function()
    {
        /*if($scope.validarDatosIngreso())
        {*/
        $scope.respuesta.banderaError=false;
        $scope.respuesta.banderaSuccess=false;
        $scope.calcularMesesTasa();
        switch($scope.data.tipoPresente)
        {
            case "NOMINAL": $scope.convercionNominalEfectiva();break;
            case "EFECTIVO":$scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100); break;
        }
        $scope.equivalenciaTiemposTasa();
        switch($scope.data.tipoFuturo)
        {
            case "NOMINAL": $scope.variablesUso.Resultado=$scope.convercionEfectivaNominal();break;
            case "EFECTIVO":$scope.variablesUso.Resultado=$scope.variablesUso.TasaEfectivaInicial; break;
        }
        $scope.conversionTiempo();
        $scope.variablesUso.denominador=(1-1/(Math.pow(1+$scope.variablesUso.Resultado,$scope.variablesUso.tiempoTotal)))/$scope.variablesUso.Resultado;
        $scope.variablesUso.Cuota=$scope.data.capital/$scope.variablesUso.denominador;
        //$scope.variablesUso.Resultado=(($scope.variablesUso.Resultado*100)/100);
        //$scope.variablesUso.Resultado=parseFloat($scope.variablesUso.Resultado.toFixed(4));
        $scope.respuesta.banderaError=false;
        $scope.respuesta.banderaSuccess=true;
        $scope.respuesta.mensajeSuccess="Datos Calculados";
        $scope.respuesta.mensajeError="";
        $scope.creacionTabla();
        /*}
        else{
            $scope.respuesta.banderaError=true;
            $scope.respuesta.banderaSuccess=false;
        }*/
    }
    $scope.creacionTabla=function(){
        var tabla=$('#Tabla');
        tabla.find('tbody').empty();
        $scope.tableData=[];
        $scope.tempData={
            capital:$scope.data.capital,
            tiempo:$scope.data.tiempo,
            index:1,
            totalCuota:$scope.data.tiempo
        };
        while($scope.tempData.index<=$scope.tempData.totalCuota) {
            var PagoExtraOrdinario=$scope.variablesUso.pagosExtraordinarios.filter(f=>f.tiempo==index);
            var record=null;
            if(PagoExtraOrdinario.length>0)
            {
                debugger
                if(PagoExtraOrdinario[0].disminuye=="CUOTA"){
                    record=$scope.bajarCuota(PagoExtraOrdinario[0]);
                }
            }
            else{
                record={
                    periodo:index,
                    capital:$scope.tempData.capital,
                    interes:$scope.tempData.capital*$scope.variablesUso.Resultado,
                    amortiz:$scope.variablesUso.Cuota-($scope.tempData.capital*$scope.variablesUso.Resultado),
                    pago:$scope.variablesUso.Cuota,
                    saldo:$scope.tempData.capital-($scope.variablesUso.Cuota-($scope.tempData.capital*$scope.variablesUso.Resultado))
                }
                $scope.tempData.capital-=$scope.variablesUso.Cuota-($scope.tempData.capital*$scope.variablesUso.Resultado)
            }
            if(record.saldo<0){
                record.pago=record.amortiz;
                record.saldo=0;
            }
            record.capital=record.capital.toFixed(2);
            record.interes=record.interes.toFixed(2);
            record.amortiz=record.amortiz.toFixed(2);
            record.pago=record.pago.toFixed(2);
            record.saldo=record.saldo.toFixed(2);
            
            $scope.tableData.push(record);
        }
        for (let count = 0; count < $scope.tableData.length; count++) {
            tabla.find('tbody').append('<tr><td>'+$scope.tableData[count].periodo+'</td><td>'+$scope.tableData[count].capital+'</td><td>'+$scope.tableData[count].interes+'</td><td>'+$scope.tableData[count].amortiz+'</td><td>'+$scope.tableData[count].pago+'</td><td>'+$scope.tableData[count].saldo+'</td></tr>')
        }
    }
    $scope.bajarCuota=function(pago){
        var interesEnTiempo=$scope.tempData.capital*$scope.variablesUso.Resultado;
        var pagoRealizado=pago.pago;
        var cuotaAnterior=$scope.variablesUso.Cuota;
        var capitalAnterior=$scope.tempData.capital;
        if(pago.incluye=="NO"){
            pagoRealizado+=$scope.variablesUso.Cuota
        }
        pagoRealizado-=interesEnTiempo;
        $scope.tempData.capital-=pagoRealizado;
        $scope.variablesUso.denominador=(1-1/(Math.pow(1+$scope.variablesUso.Resultado,($scope.tempData.tiempo-pago.tiempo))))/$scope.variablesUso.Resultado;
        $scope.variablesUso.Cuota=$scope.tempData.capital/$scope.variablesUso.denominador;
        return {
            periodo:pago.tiempo,
            capital:capitalAnterior,
            interes:interesEnTiempo,
            amortiz:pagoRealizado,
            pago:pagoRealizado+interesEnTiempo,
            saldo:capitalAnterior-pagoRealizado
        }
    }
    $scope.bajarTiempo=function(pago){
        var interesEnTiempo=$scope.tempData.capital*$scope.variablesUso.Resultado;
        var pagoRealizado=pago.pago;
        var cuotaAnterior=$scope.variablesUso.Cuota;
        var capitalAnterior=$scope.tempData.capital;
        if(pago.incluye=="NO"){
            pagoRealizado+=$scope.variablesUso.Cuota
        }
        pagoRealizado-=interesEnTiempo;
        $scope.tempData.capital-=pagoRealizado;
        var valor1=Math.log((($scope.tempData.capital/$scope.variablesUso.Cuota)*$scope.variablesUso.Resultado)-1)
        var valor2=Math.log(1+$scope.variablesUso.Resultado);
        var resultado=(valor1/valor2)*(-1);

    }
    $scope.conversionTiempo=function(){
        //$scope.variablesUso.tiempoTotal=$scope.variablesUso.cantidadTipoPagoFuturo*$scope.data.tiempo;
        $scope.variablesUso.tiempoTotal=$scope.data.tiempo;
    }
    $scope.convercionEfectivaNominal=function(){
        return $scope.variablesUso.TasaEfectivaInicial*$scope.variablesUso.cantidadTipoPagoFuturo;
    }
    $scope.equivalenciaTiemposTasa=function(){
        switch($scope.data.formaPagoFuturo)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoFuturo=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoFuturo=1;break;
        }
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.porcentajeEfectivo+1,$scope.variablesUso.cantidadTipoPagoPresente);
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.TasaEfectivaInicial,1/$scope.variablesUso.cantidadTipoPagoFuturo)-1;
    }
    $scope.calcularMesesTasa=function(){
        switch($scope.data.formPagoPresente)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoPresente=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoPresente=1;break;
        }
    }
    $scope.convercionNominalEfectiva=function(){
        $scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100)/$scope.variablesUso.cantidadTipoPagoPresente;
    }
})
app.controller("conversionController", function($scope) {
    $scope.data=[];
    $scope.respuesta=[];
    $scope.respuesta.banderaError=false;
    $scope.respuesta.mensajeError="";
    $scope.respuesta.banderaSuccess=false;
    $scope.respuesta.mensajeSuccess="";
    $scope.variablesUso=[];
    $scope.Calcular=function()
    {
        if($scope.validarDatosIngreso())
        {
            $scope.respuesta.banderaError=false;
            $scope.respuesta.banderaSuccess=false;
            $scope.calcularMesesTasa();
            switch($scope.data.tipoPresente)
            {
                case "NOMINAL": $scope.convercionNominalEfectiva();break;
                case "EFECTIVO":$scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100); break;
            }
            $scope.equivalenciaTiemposTasa();
            switch($scope.data.tipoFuturo)
            {
                case "NOMINAL": $scope.variablesUso.Resultado=$scope.convercionEfectivaNominal()*100;break;
                case "EFECTIVO":$scope.variablesUso.Resultado=$scope.variablesUso.TasaEfectivaInicial*100; break;
            }
            $scope.variablesUso.Resultado=(($scope.variablesUso.Resultado*100)/100);
            $scope.variablesUso.Resultado=parseFloat($scope.variablesUso.Resultado.toFixed(4));
            $scope.respuesta.banderaError=false;
            $scope.respuesta.banderaSuccess=true;
            $scope.respuesta.mensajeSuccess="Datos Calculados";
            $scope.respuesta.mensajeError="";
        }
        else{
            $scope.respuesta.banderaError=true;
            $scope.respuesta.banderaSuccess=false;
        }
    }
    $scope.convercionEfectivaNominal=function(){
        return $scope.variablesUso.TasaEfectivaInicial*$scope.variablesUso.cantidadTipoPagoFuturo;
    }
    $scope.equivalenciaTiemposTasa=function(){
        switch($scope.data.formaPagoFuturo)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoFuturo=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoFuturo=1;break;
        }
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.porcentajeEfectivo+1,$scope.variablesUso.cantidadTipoPagoPresente);
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.TasaEfectivaInicial,1/$scope.variablesUso.cantidadTipoPagoFuturo)-1;
    }
    $scope.calcularMesesTasa=function(){
        switch($scope.data.formPagoPresente)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoPresente=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoPresente=1;break;
        }
    }
    $scope.convercionNominalEfectiva=function(){
        $scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100)/$scope.variablesUso.cantidadTipoPagoPresente;
    }
    $scope.validarDatosIngreso=function()
    {
        if  ($scope.data.porcentaje!=undefined)
        {
            if ($scope.data.porcentaje==0)
            {
                $scope.respuesta.mensajeError="El porcentaje no puede ser 0.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe Digitar el porcentaje.";
            return false;
        }
        if  ($scope.data.tipoPresente!=undefined)
        {
            if ($scope.data.tipoPresente=="")
            {
                $scope.respuesta.mensajeError="El Tipo Presente no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el tipo presente.";
            return false;
        }
        if  ($scope.data.formPagoPresente!=undefined)
        {
            if ($scope.data.formPagoPresente=="")
            {
                $scope.respuesta.mensajeError="El forma de pago presente no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el forma de pago presente.";
            return false;
        }
        
        if  ($scope.data.tipoFuturo!=undefined)
        {
            if ($scope.data.tipoFuturo=="")
            {
                $scope.respuesta.mensajeError="El tipo futuro  no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el tipo futuro.";
            return false;
        }
        if  ($scope.data.formaPagoFuturo!=undefined)
        {
            if ($scope.data.formaPagoFuturo=="")
            {
                $scope.respuesta.mensajeError="El forma de pago futuro no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar la forma de pago futuro.";
            return false;
        }
        return true;
    }
    $scope.InvertirTasa=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.copyData=[]
        $scope.copyData.porcentaje=$scope.data.porcentaje;
        $scope.copyData.tipoPresente=$scope.data.tipoPresente;
        $scope.copyData.formPagoPresente=$scope.data.formPagoPresente;
        $scope.copyData.tipoFuturo=$scope.data.tipoFuturo;
        $scope.copyData.formaPagoFuturo=$scope.data.formaPagoFuturo;
        $scope.data=[];
        $scope.data.porcentaje=$scope.variablesUso.Resultado;
        $scope.data.tipoPresente=$scope.copyData.tipoFuturo;
        $scope.data.formPagoPresente=$scope.copyData.formaPagoFuturo;
        $scope.data.tipoFuturo=$scope.copyData.tipoPresente;
        $scope.data.formaPagoFuturo=$scope.copyData.formPagoPresente;
        $scope.variablesUso=[];
        $scope.Calcular();
    }
    $scope.Nueva=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.variablesUso=[];
        $scope.data=[];
    }

});