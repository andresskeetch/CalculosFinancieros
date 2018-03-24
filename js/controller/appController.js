var app = angular.module("CalculosFinancieros", []);

app.controller("appController", function($scope) {
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